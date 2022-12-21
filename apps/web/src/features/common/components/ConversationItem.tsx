import {
  UnstyledButton,
  UnstyledButtonProps,
  Group,
  Text,
  createStyles,
  Box,
} from "@mantine/core";
import { IUserDoc, JWTUser } from "interfaces";
import { UserAvatar } from "./UserAvatar";

const useStyles = createStyles((theme) => ({
  user: {
    display: "block",
    width: "100%",
    padding: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[0],
    },
    borderRadius: theme.radius.sm,
    overflow: "hidden",
  },
  userActive: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[8]
        : theme.colors.blue[0],
  },
  container: {
    "&:not(:last-child)": {
      paddingBottom: 2,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },
  },
}));

interface ConversationItemProps extends UnstyledButtonProps {
  user?: JWTUser | IUserDoc;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export function ConversationItem({
  user,
  active,
  onClick,
  ...others
}: ConversationItemProps) {
  const { classes, cx } = useStyles();

  return (
    <Box className={classes.container}>
      <UnstyledButton
        className={cx(classes.user, {
          [classes.userActive]: active,
        })}
        onClick={onClick}
        {...others}
      >
        <Group>
          <UserAvatar user={user} />

          <div style={{ flex: 1 }} className="border-b-2">
            <Text size="sm" weight={500}>
              {user?.name}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    </Box>
  );
}
