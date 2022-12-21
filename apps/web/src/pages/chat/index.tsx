import {
  Button,
  Group,
  Input,
  Stack,
  Text,
  Box,
  useMantineTheme,
  Popover,
  ActionIcon,
  Center,
  Badge,
  ThemeIcon,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "~/features/auth";
import { ChatBubble, useChat, useSocket } from "~/features/chat";
import { UserAvatar } from "~/features/common";
import { Lock, MoodHappy } from "tabler-icons-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { ParsedKeyView } from "~/features/key/components/ArmoredKeyView/ParsedKeyView";

export default function Home() {
  let init = false;
  [];
  const theme = useMantineTheme();
  const { socket } = useSocket();
  const [value, setValue] = useState("");
  const {
    conversationItem,
    messages,
    sendMessage,
    setMessages,
    receiverPublicKey,
    conversationId,
  } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (socket && !init) {
      /**
       * When we receive a message from the socket server for real time chat
       * We update the message list
       */
      socket.on("getMessage", (receivedMessage) => {
        console.log("[Get message from socket]", receivedMessage);

        //Check if the message is for the current conversation
        setMessages((prev) => [
          ...prev,
          {
            ...receivedMessage,
            createdAt: Date.now(),
          },
        ]);
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
      init = true;
    }

    return () => {
      socket?.off("getMessage");
    };
  }, [socket]);

  const handleSendMessage = async () => {
    if (socket && conversationItem) {
      setValue("");

      await sendMessage(value);
    }
  };

  const conversationPlaceholder = (
    <Center className="flex-1">
      <Badge color="blue">Select a conversation to start messaging</Badge>
    </Center>
  );

  const conversationContent = (
    <>
      <Box
        className="sticky bg-black top-[70px] z-[2]"
        style={{
          background:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
          borderBottom: `0.5px solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[4]
          }`,
        }}
        px="md"
        py="sm"
      >
        {conversationItem && (
          <Group position="apart">
            <Group>
              <UserAvatar user={conversationItem.receiver} />
              <div>
                <Text size="md" weight={500}>
                  {conversationItem.receiver.name}
                </Text>
                <Text size="sm" color="dimmed">
                  {conversationItem.receiver.username}
                </Text>
              </div>
            </Group>

            {/* <Button onClick={genRSA}>Gen RSA</Button> */}

            <Popover width={500} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <ActionIcon variant="default">
                  <Lock size={18} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack className="overflow-auto max-h-[500px]">
                  <Text className="text-green-500" weight={500}>
                    End-to-end encryption
                  </Text>
                  <Text>
                    {conversationItem.receiver.name}&apos;s public key:
                  </Text>
                  <div>
                    <ParsedKeyView armoredKey={receiverPublicKey} />
                  </div>
                  <Text className="break-words" size="sm">
                    {receiverPublicKey}
                  </Text>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>
        )}
      </Box>

      <Box px="sm" className="pb-4 grow min-h-min">
        <Stack>
          {messages.map((message, i) =>
            conversationId == message.conversationId ? (
              <ChatBubble
                key={message.content}
                message={message}
                isSender={user?.id === message.senderId}
                isLast={i === messages.length - 1}
              />
            ) : null
          )}
        </Stack>
      </Box>

      <Box
        px="sm"
        className="sticky bottom-0 py-4"
        style={{
          background:
            theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Group spacing="xs">
            <Popover width={450} shadow="md">
              <Popover.Target>
                <ActionIcon size="lg">
                  <MoodHappy size={18} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown
                className="bg-transparent border-0"
                px={0}
                pb={5}
                pt={0}
              >
                <EmojiPicker
                  width="100%"
                  theme={Theme.DARK}
                  onEmojiClick={(emojiData, e) => {
                    setValue(value + emojiData.emoji);
                  }}
                />
              </Popover.Dropdown>
            </Popover>

            <Input
              required
              onChange={(e: React.FormEvent<HTMLInputElement>) =>
                setValue(e.currentTarget.value)
              }
              value={value}
              className="flex-1"
              placeholder="Message"
            />

            <Button type="submit">Send</Button>
          </Group>
        </form>
      </Box>
    </>
  );
  return (
    <Stack className="min-h-full">
      {conversationItem ? conversationContent : conversationPlaceholder}
    </Stack>
  );
}
