import { useContext } from "react";
import { KeyManagerContext } from "../context";

export const useKeyManager = () => {
  const context = useContext(KeyManagerContext);

  if (context === undefined) {
    throw new Error("useKeyManager must be used within a KeyManagerProvider");
  }

  return context;
};
