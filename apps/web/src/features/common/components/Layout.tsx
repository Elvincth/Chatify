import { AppShell, useMantineTheme, Container } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Header, Navbar } from "~/features/common";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [defaultLayout, setDefaultLayout] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (
      router.pathname.startsWith("/login") ||
      router.pathname.startsWith("/register")
    ) {
      setDefaultLayout(false);
    } else {
      setDefaultLayout(true);
    }
  }, [router.pathname]);

  return defaultLayout ? (
    <>
      <AppShell
        padding={0}
        styles={{
          main: {
            background:
              theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
          },
        }}
        navbarOffsetBreakpoint={640}
        asideOffsetBreakpoint={640}
        fixed
        navbar={<Navbar opened={opened} onChange={setOpened} />}
        header={<Header opened={opened} onChange={setOpened} />}
      >
        {children}
      </AppShell>
    </>
  ) : (
    <>{children}</>
  );
}
