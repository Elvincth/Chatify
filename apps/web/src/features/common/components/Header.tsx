import {
  ActionIcon,
  Burger,
  Group,
  Header as ManHeader,
  MediaQuery,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { useEffect } from "react";
import { IconSun, IconMoonStars } from "@tabler/icons";
import { SearchUser } from "./SearchUser";
import { Logo } from "./Logo";

interface IHeaderProps {
  onChange: (opened: boolean) => void;
  opened: boolean;
}

export const Header = ({ onChange, opened }: IHeaderProps) => {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const dark = colorScheme === "dark";

  useEffect(() => {
    onChange(opened);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  return (
    <ManHeader className="z-[101]" height={70} p="md">
      <div className="flex items-center justify-between h-full">
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={opened}
            onClick={() => onChange(!opened)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>

        <Link href="/">
          <Group spacing="xs">
            <Logo size={32} />

            <div className="hidden text-xl font-semibold md:block">Chatify</div>
          </Group>
        </Link>

        <SearchUser />

        <ActionIcon
          variant="subtle"
          onClick={() => toggleColorScheme()}
          title="Toggle color scheme"
        >
          {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
        </ActionIcon>
      </div>
    </ManHeader>
  );
};
