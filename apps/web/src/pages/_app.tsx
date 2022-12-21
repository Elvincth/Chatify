import type { AppContext, AppProps } from "next/app";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import "~/styles/tailwind.css";
import "~/styles/global.css";
import { ChatProvider, SocketProvider } from "~/features/chat";
import { useRouter } from "next/router";
import { getCookie, setCookie } from "cookies-next";
import { useState } from "react";
import { AuthProvider } from "~/features/auth";
import { Layout } from "~/features/common";
import App from "next/app";
import Head from "next/head";
import { KeyManagerProvider } from "~/features/key";

export default function MyApp(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const router = useRouter();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    setCookie("color-scheme", nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  if (router.route === "/_error") return <Component {...pageProps} />;

  return (
    <>
      <Head>
        <title>Chatify</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <MantineProvider
        theme={{
          fontFamily: "Poppins, sans-serif",
          headings: { fontFamily: "Poppins, sans-serif" },
          primaryColor: "blue",
          colorScheme,
          breakpoints: {
            //use tailwind breakpoints
            xs: 0,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
          },
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <ColorSchemeProvider
          colorScheme={"dark"}
          toggleColorScheme={toggleColorScheme}
        >
          <NotificationsProvider autoClose={5000}>
            <AuthProvider>
              <SocketProvider>
                <KeyManagerProvider>
                  <ChatProvider>
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  </ChatProvider>
                </KeyManagerProvider>
              </SocketProvider>
            </AuthProvider>
          </NotificationsProvider>
        </ColorSchemeProvider>
      </MantineProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  return {
    ...appProps,
    colorScheme: getCookie("color-scheme", appContext.ctx) || "dark",
  };
};
