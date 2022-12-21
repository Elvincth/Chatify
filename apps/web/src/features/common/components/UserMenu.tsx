import React, { useState } from "react";
import {
  Box,
  useMantineTheme,
  Text,
  Menu,
  UnstyledButton,
  Group,
} from "@mantine/core";
import { ChevronRight, Key, Logout } from "tabler-icons-react";
import { useAuth } from "~/features/auth";
import { UserAvatar } from "./UserAvatar";
import { useKeyManager } from "~/features/key";

export function UserMenu() {
  const theme = useMantineTheme();
  const { user, logout } = useAuth();
  const { openKeyManager } = useKeyManager();

  return (
    <Box
      sx={{
        paddingTop: theme.spacing.sm,
        borderTop: `1px solid ${
          theme.colorScheme === "dark"
            ? theme.colors.dark[4]
            : theme.colors.gray[2]
        }`,
      }}
    >
      <Menu withArrow shadow="md" width={250} offset={25}>
        <Menu.Target>
          <UnstyledButton
            sx={{
              display: "block",
              width: "100%",
              padding: theme.spacing.xs,
              borderRadius: theme.radius.sm,
              color:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.black,

              "&:hover": {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              },
            }}
          >
            <Group>
              <UserAvatar user={user} />

              <Box sx={{ flex: 1 }}>
                <Text size="sm" weight={500}>
                  {user?.name}
                </Text>
                <Text size="xs" color="dimmed">
                  {user?.username}
                </Text>
              </Box>

              <ChevronRight size={18} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Key management</Menu.Label>
          <Menu.Item onClick={() => openKeyManager()} icon={<Key size={18} />}>
            Manage my keys
          </Menu.Item>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item icon={<Logout size={16} />} onClick={logout}>
            Sign Out
          </Menu.Item>
          <Menu.Label>ID: {user?.id}</Menu.Label>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}
