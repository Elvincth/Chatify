namespace NodeJS {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_SOCKET_URI: string;
  }
}
