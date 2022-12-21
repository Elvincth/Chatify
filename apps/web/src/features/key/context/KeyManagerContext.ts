import { createContext, Dispatch, SetStateAction } from "react";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface ExportPemParams {
  key: string;
  fileName: string;
}
export interface OpenKeyCreator {
  closeable?: boolean;
}
export interface CreateKeyPair {
  passphrase: string;
}

export interface KeyManagerContextProps {
  keyPair: KeyPair;
  exportToPem: (data: ExportPemParams) => void;
  setKeyPair: (keyPair: KeyPair) => void;
  createKeyPair: ({ passphrase }: CreateKeyPair) => Promise<KeyPair>;
  openKeyCreator: ({ closeable }: OpenKeyCreator) => void;
  openKeyManager: () => void;
  openKeyPassphraseInput: () => void;
  exportAscKeyPair: () => Promise<void>;
  importAscKeyPair: (file: File) => Promise<KeyPair>;
  passphrase: string;
  setPassphrase: Dispatch<SetStateAction<string>>;
}

export const KeyManagerContext = createContext<KeyManagerContextProps>(
  undefined!
);
