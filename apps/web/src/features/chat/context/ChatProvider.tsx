import { IUserDoc } from "interfaces";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useAuth } from "~/features/auth";
import { getConversationList } from "~/utils";
import {
  ChatContext,
  DecryptMessage,
  IConversationItem,
  IMessageItem,
} from "./ChatContext";
import {
  getMessageListSWR,
  getPublicKeySWR,
  sendMessage as _sendMessage,
} from "~/utils/request";
import { useSocket } from "../hooks";
import { useKeyManager } from "~/features/key";
import { decryptPgpMessage, encryptPgpMessage } from "~/utils/crypto";

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { keyPair, passphrase } = useKeyManager();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string>();
  const {
    data: conversationsList,
    mutate: updateConversationList,
    isValidating: conversationListLoading,
  } = useSWR(user ? "getConversationList" : null, getConversationList, {
    // revalidateOnFocus: false,
    // revalidateOnReconnect: false,
  });
  const [conversations, setConversations] = useState<IConversationItem[]>([]);
  const [conversationItem, setConversationItem] = useState<IConversationItem>();
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  //Messages from previous saved conversation
  const {
    data: messageList,
    mutate: updateMessageList,
    isValidating: messageListLoading,
  } = useSWR(
    conversationId ? ["getMessageListSWR", conversationId] : null,
    getMessageListSWR,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: true,
    }
  );
  const { socket } = useSocket();
  // const [receiverPublicKey, setReceiverPublicKey] = useState<string>();
  //use swr for conversationItem.receiver._id to get the public key
  const {
    data: receiverPublicKey,
    mutate: updateReceiverPublicKey,
    isValidating: receiverPublicKeyLoading,
  } = useSWR(
    conversationItem?.receiver._id
      ? ["getPublicKeySWR", conversationItem?.receiver._id]
      : null,
    getPublicKeySWR
  );

  //Where we update the conversation list
  useEffect(() => {
    if (conversationsList && user) {
      const newConversations = conversationsList.map((item) => ({
        id: item._id,
        //Where we exclude the current user from the conversation
        receiver: item.participants.find(
          (u: IUserDoc) => u._id !== user.id
        ) as IUserDoc,
      }));

      setConversations(newConversations);
    }
  }, [conversationsList, user]);

  //Where we update the message list
  useEffect(() => {
    if (messageList) {
      const newMessages = messageList.map((item) => {
        const { content, senderContent, senderId, createdAt, conversationId } =
          item;

        return {
          senderContent,
          content,
          senderId,
          createdAt: createdAt as string,
          conversationId,
        };
      });

      setMessages(newMessages);
    }
  }, [messageList]);

  const getConversation = (id?: string) => {
    if (!id) return;
    return conversations.find((item) => item.id === id);
  };

  /**
   * Decrypts received message using the current user's private key
   */
  const decryptReceivedMessage = async (data: string) => {
    try {
      if (receiverPublicKey) {
        const { privateKey } = keyPair;
        //Decrypt the message using the current user's private key
        //and verify the sender's public key
        //because it is the sender message that is encrypted
        const decrypted = await decryptPgpMessage({
          passphrase,
          publicKeyArmored: receiverPublicKey,
          privateKeyArmored: privateKey,
          message: data,
        });

        return {
          message: decrypted.decryptedMessage,
          details: decrypted,
        };
      } else {
        return {
          message: "Sender public key not found",
        };
      }
    } catch (e) {
      console.log(e);
      return {
        message: "Fail to decrypt message",
      };
    }
  };

  /**
   * Decrypts our send out message using our own public key
   * Also we will verify using our own public key
   */
  const decryptSentMessage = async (data: string): Promise<DecryptMessage> => {
    try {
      if (receiverPublicKey) {
        const { privateKey, publicKey } = keyPair;
        //Decrypt using our own private key, and verify using our own public key
        //As this is the message we sent out
        const decrypted = await decryptPgpMessage({
          passphrase,
          publicKeyArmored: publicKey,
          privateKeyArmored: privateKey,
          message: data,
        });

        return {
          message: decrypted.decryptedMessage,
          details: decrypted,
        };
      } else {
        return {
          message: "Sender public key not found",
        };
      }
    } catch (e) {
      console.log(e);
      return {
        message: `Fail to decrypt message ${e}`,
      };
    }
  };

  //Send message with given conversation id
  //Where we handle all the encryption and sending
  const sendMessage = async (content: string) => {
    if (
      conversationId &&
      socket &&
      user &&
      conversationItem &&
      receiverPublicKey
    ) {
      const encryptedContentForReceiver = await encryptPgpMessage({
        passphrase,
        publicKeyArmored: receiverPublicKey,
        privateKeyArmored: keyPair.privateKey,
        message: content,
      });
      /**
       * We are encrypting a copy of the send out message with our own public key
       * so that we can decrypt it later
       * as we need to read back our own messages
       * to show them in the chat
       */
      const encryptedContentForSender = await encryptPgpMessage({
        passphrase,
        publicKeyArmored: keyPair.publicKey,
        privateKeyArmored: keyPair.privateKey,
        message: content,
      });

      //The message we send to the server
      const messagePayload = {
        content: encryptedContentForReceiver.encryptedMessage,
        senderContent: encryptedContentForSender.encryptedMessage,
      };

      // console.log("messagePayload", messagePayload);

      //Set the message to the message list, with optimistic update
      setMessages((prev) => [
        ...prev,
        {
          ...messagePayload,
          //Keep the original content in plain text, so we don't waste time decrypting it
          originalSendContent: {
            content,
            encryptDetailsForSender: encryptedContentForSender.details,
            encryptDetailsForReceiver: encryptedContentForReceiver.details,
          },
          senderId: user?.id,
          createdAt: Date.now(),
          conversationId,
        },
      ]);

      //Emit a send message event to the server
      socket.emit("sendMessage", {
        receiverId: conversationItem.receiver._id,
        conversationId,
        ...messagePayload,
      });

      //Send the message to the server also
      await _sendMessage({
        conversationId,
        ...messagePayload,
      });
    } else {
      throw new Error("No conversation selected");
    }
  };

  useEffect(() => {
    if (conversationId) {
      setConversationItem(getConversation(conversationId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, conversationId]);

  // useEffect(() => {
  //   if (conversationItem) {
  //     getPublicKey(conversationItem.receiver._id).then((res) => {
  //       // console.log("Receiver public key", res.publicKey);
  //       setReceiverPublicKey(res.publicKey);
  //     });
  //   }
  // }, [conversationItem]);

  return (
    <>
      <ChatContext.Provider
        value={{
          messages,
          conversationListLoading,
          conversationItem,
          getConversation,
          conversationId,
          setConversationId,
          conversations,
          updateConversationList,
          sendMessage,
          decryptReceivedMessage,
          decryptSentMessage,
          setMessages,
          receiverPublicKey,
          messageListLoading,
        }}
      >
        {children}
      </ChatContext.Provider>
    </>
  );
};
