import {
  ActionIcon,
  Group,
  Modal,
  Tooltip,
  Card,
  Text,
  Spoiler,
  Stack,
  Button,
} from "@mantine/core";
import { format } from "timeago.js";
import clsx from "clsx";
import { IMessageItem } from "../context";
import { useEffect, useRef, useState } from "react";
import { useKeyManager } from "~/features/key";
import { useChat } from "~/features/chat";
import { ChevronDown } from "tabler-icons-react";
import { PgpDecryptDetails, PgpEncryptDetails } from "~/utils/crypto";
import { ArmoredKeyView } from "~/features/key/components/ArmoredKeyView";

interface ChatBubbleProps {
  isSender?: boolean;
  message: IMessageItem;
  isLast?: boolean;
}

export const ChatBubble = ({ message, isSender = false }: ChatBubbleProps) => {
  const { keyPair } = useKeyManager();
  const { decryptSentMessage, decryptReceivedMessage, receiverPublicKey } =
    useChat();
  const { content, senderContent, createdAt, originalSendContent } = message;
  const [openDetails, setOpenDetails] = useState(false);
  const [openEncDetails, setOpenEncDetails] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState("Decrypting...");
  const [encryptDetailsForReceiver, setEncryptDetailsForReceiver] =
    useState<PgpEncryptDetails>();
  const [details, setDetails] = useState<PgpDecryptDetails>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (receiverPublicKey) {
      // /  console.log(message);
      if (isSender && originalSendContent) {
        setDecryptedContent(originalSendContent.content);

        setEncryptDetailsForReceiver(
          originalSendContent.encryptDetailsForReceiver
        );

        decryptSentMessage(senderContent).then((decrypted) => {
          setDetails(decrypted.details);
        });

        return;
      }

      if (isSender && senderContent) {
        //Decrypt sender content using our private key
        decryptSentMessage(senderContent).then((decrypted) => {
          setDecryptedContent(decrypted.message);
          setDetails(decrypted.details);
          console.log(decrypted.details);
          console.log(decrypted.message);
          // decrypted.details?.parseArmoredMessage.packets.forEach((p: any) => {
          //   console.log(key);
          //   console.log(p.publicKeyID);
          // })
        });
        return;
      }

      if (content && !isSender) {
        //Decrypt content using our private key and verify using sender public key
        decryptReceivedMessage(content).then((decrypted) => {
          setDecryptedContent(decrypted.message);
          setDetails(decrypted.details);
        });
        return;
      }
    }
    //eslint-disable-next-line
  }, [message, keyPair, receiverPublicKey]);

  //If is last and scroll ref is available, scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView();
    }
  }, [scrollRef, decryptedContent]);

  return (
    <Group ref={scrollRef} position={isSender ? "right" : "left"}>
      <Group
        spacing={6}
        className={clsx(
          "px-3 py-1.5 max-w-max w-[400px] break-words text-sm rounded-md",
          {
            "bg-blue-500 text-white": isSender,
            "bg-gray-200 text-gray-700 border-gray-200": !isSender,
          }
        )}
      >
        <div className="break-all">
          {decryptedContent}

          {details?.decryptionFailed &&
            `Fail to decrypt message ${details?.decryptionFailedReason}`}

          {!details?.decryptionFailed && details
            ? details.signatureVerified
              ? ""
              : " (Signature invalid)"
            : ""}
        </div>
        <div
          className={clsx("text-xs italic", {
            "text-gray-200": isSender,
            "text-gray-500": !isSender,
          })}
        >
          {format(createdAt)}
        </div>

        <Modal
          title="Encryption Details"
          size={900}
          opened={openEncDetails}
          onClose={() => setOpenEncDetails(false)}
        >
          {encryptDetailsForReceiver && (
            <Stack>
              <Card shadow="sm" p="xl">
                <Text weight={500} size="lg">
                  Message sent in plain text
                </Text>

                <div className="mt-2">
                  {encryptDetailsForReceiver.decryptedMessage}
                </div>
              </Card>

              <Card shadow="sm" p="xl">
                <Text weight={500} size="lg">
                  Encrypted Message
                </Text>

                <Text mt="xs" color="dimmed" size="xs">
                  <Spoiler
                    maxHeight={170}
                    showLabel="Show more"
                    hideLabel="Hide"
                  >
                    {encryptDetailsForReceiver.encryptedMessage}
                  </Spoiler>
                </Text>
              </Card>

              <ArmoredKeyView
                keyName="Sign Key"
                armoredKey={encryptDetailsForReceiver.signKeyRaw}
              />

              <Card shadow="sm" p="xl">
                <Text weight={500} size="lg">
                  Compression Algorithm
                </Text>

                <div className="mt-2">
                  <Text size="md">
                    {encryptDetailsForReceiver.compressionAlgorithm}
                  </Text>
                </div>
              </Card>

              <Card shadow="sm" p="xl">
                <Text weight={500} size="lg">
                  One Time Session Key
                </Text>

                <div className="mt-2">
                  <Text mt="xs" size="md">
                    Key: {encryptDetailsForReceiver.sessionKey}
                  </Text>
                </div>

                <div className="mt-2">
                  <Text mt="xs" size="md">
                    Algorithm: {encryptDetailsForReceiver.sessionKeyAlgorithm}
                  </Text>
                </div>
              </Card>

              <ArmoredKeyView
                keyName="Encryption Key"
                armoredKey={encryptDetailsForReceiver.encryptionKeyRaw}
              />
            </Stack>
          )}
        </Modal>

        <Modal
          title="Decryption Details"
          size={900}
          opened={openDetails}
          onClose={() => setOpenDetails(false)}
        >
          <Stack>
            {details && (
              <>
                {encryptDetailsForReceiver && (
                  <Card shadow="sm" p="xl">
                    <Text weight={500} size="lg">
                      Encryption details for receiver
                    </Text>

                    <Button
                      mt="sm"
                      onClick={() => {
                        setOpenDetails(false);
                        setOpenEncDetails(true);
                      }}
                    >
                      Show Details
                    </Button>
                  </Card>
                )}

                <Card shadow="sm" p="xl">
                  <Text weight={500} size="lg">
                    Encrypted Message
                  </Text>

                  <div className="mt-2">
                    <Text mt="xs" color="dimmed" size="xs">
                      <Spoiler
                        maxHeight={170}
                        showLabel="Show more"
                        hideLabel="Hide"
                      >
                        {details.encryptedMessage}
                      </Spoiler>
                    </Text>
                  </div>
                </Card>

                <ArmoredKeyView
                  keyName="Decryption Key"
                  armoredKey={details.decryptionKeyRaw}
                />

                <Card shadow="sm" p="xl">
                  <Text weight={500} size="lg">
                    One Time Session Key
                  </Text>
 
                  <div className="mt-2">
                    <Text mt="xs" size="md">
                      Key: {details.sessionKey}
                    </Text>
                  </div>

                  <div className="mt-2">
                    <Text mt="xs" size="md">
                      Algorithm: {details.sessionKeyAlgorithm}
                    </Text>
                  </div>
                </Card>

                <Card shadow="sm" p="xl">
                  <Text weight={500} size="lg">
                    Decompress Algorithm
                  </Text>

                  <div className="mt-2">
                    <Text size="md">{details.compressionAlgorithm}</Text>
                  </div>
                </Card>

                <Card shadow="sm" p="xl">
                  <Text weight={500} size="lg">
                    Decrypted Message
                  </Text>

                  <div className="mt-2">{details.decryptedMessage}</div>
                </Card>

                <ArmoredKeyView
                  keyName="Verification Key"
                  armoredKey={details.verificationKeyRaw}
                />

                <Card shadow="sm" p="xl">
                  <Text weight={500} size="lg">
                    Signature Verification
                  </Text>

                  <div className="mt-2">
                    <Text
                      size="md"
                      color={details.signatureVerified ? "green" : "red"}
                    >
                      {details.signatureVerified ? "Verified" : "Invalid"}
                    </Text>
                  </div>
                </Card>

                <Card shadow="sm" p="xl">
                  <Text weight={500} size="lg">
                    Parsed Message
                  </Text>

                  <div className="mt-2">
                    <Button
                      onClick={() => {
                        console.clear();
                        console.log(details.parseArmoredMessage);
                      }}
                    >
                      Log Parsed Message
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </Stack>
        </Modal>

        <Tooltip label="View details">
          <ActionIcon
            onClick={() => setOpenDetails(true)}
            size="sm"
            className={clsx({
              "text-white": isSender,
              "text-gray-400": !isSender,
            })}
          >
            <ChevronDown size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
};
