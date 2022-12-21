import { Loader, Navbar as MantineNavbar, Stack } from "@mantine/core";
import { ConversationItem } from "./ConversationItem";
import { UserMenu } from "./UserMenu";
import { useEffect } from "react";
import { IUserDoc } from "interfaces";
import { useChat } from "~/features/chat";

interface INavbarProps {
  onChange: (opened: boolean) => void;
  opened: boolean;
}

export const Navbar = ({ opened = false, onChange }: INavbarProps) => {
  const { setConversationId, conversationId, conversations } = useChat();

  // //Select the first one  if there is no selected conversation
  // useEffect(() => {
  //   if (conversations.length > 0 && !conversationId) {
  //     console.log(conversations[0]);
  //     setConversationId(conversations[0].id);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [conversations]);

  return (
    <MantineNavbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!opened}
      width={{ sm: 200, lg: 300 }}
      className="z-[100] sm:z-[0]"
    >
      <MantineNavbar.Section className="overflow-auto" grow mx="-xs" px="xs">
        <Stack spacing={5}>
          {conversations?.map((item) => (
            <ConversationItem
              active={conversationId == item.id}
              onClick={() => setConversationId(item.id)}
              key={item.id}
              user={item.receiver}
            />
          ))}
        </Stack>
      </MantineNavbar.Section>

      <MantineNavbar.Section>
        <UserMenu />
      </MantineNavbar.Section>
    </MantineNavbar>
  );
};
