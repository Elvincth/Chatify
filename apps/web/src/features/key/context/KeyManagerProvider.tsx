import {
  CreateKeyPair,
  ExportPemParams,
  KeyManagerContext,
  KeyPair,
  OpenKeyCreator,
} from "./KeyManagerContext";
import { setPublicKey } from "~/utils";
import { useAuth } from "~/features/auth";
import { useEffect, useState } from "react";
import { KeyCreator } from "../components/KeyCreator";
import { KeyPassphraseInput } from "../components/KeyPassphraseInput";
import {
  generatePgpKeyPair,
  importAscKeyPair as _importAscKeyPair,
  exportAscKeyPair as _exportAscKeyPair,
} from "~/utils/crypto";
import { KeyManager } from "../components";

interface IKeyManagerProvider {
  children: React.ReactNode;
}

//A key manager for the user
export const KeyManagerProvider = ({ children }: IKeyManagerProvider) => {
  const { user } = useAuth();
  const [CRYPTO_LOCAL_STORAGE_KEY, setCryptoLocalStorageKey] =
    useState<string>();
  const [keyCreatorOpened, setKeyCreatorOpened] = useState(false);
  const [keyManagerOpened, setKeyManagerOpened] = useState(false);
  const [keyPassphraseInputOpened, setKeyPassphraseInputOpened] =
    useState(false);
  const [isCloseable, setIsCloseable] = useState(false);
  const [keyPair, _setKeyPair] = useState({
    publicKey: "",
    privateKey: "",
  });
  const [passphrase, setPassphrase] = useState("");

  useEffect(() => {
    if (user) {
      //Set up the storage key name as crypto-${user.id}
      setCryptoLocalStorageKey(`crypto-${user.id}`);
    }
  }, [user]);

  //Check if the user has a public key
  useEffect(() => {
    if (CRYPTO_LOCAL_STORAGE_KEY && user) {
      //check if that key is in the local storage
      const keyPair = localStorage.getItem(CRYPTO_LOCAL_STORAGE_KEY);
      if (!keyPair) {
        setKeyCreatorOpened(true);
      } else {
        setKeyPassphraseInputOpened(true);
      }
    }
  }, [CRYPTO_LOCAL_STORAGE_KEY, user]);

  //setKeyPair using local storage with key CRYPTO_LOCAL_STORAGE_KEY
  const setKeyPair = (keyPair: KeyPair) => {
    if (CRYPTO_LOCAL_STORAGE_KEY) {
      _setKeyPair(keyPair);
      localStorage.setItem(CRYPTO_LOCAL_STORAGE_KEY, JSON.stringify(keyPair));
    }
  };

  //get keyPair from local storage
  useEffect(() => {
    if (user && CRYPTO_LOCAL_STORAGE_KEY) {
      const keyPair = localStorage.getItem(CRYPTO_LOCAL_STORAGE_KEY);
      if (keyPair) {
        setKeyPair(JSON.parse(keyPair));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, CRYPTO_LOCAL_STORAGE_KEY]);

  //Export the current stored private key from to a pem file

  //Export the current stored  key from to a pem file
  const exportToPem = ({ key, fileName }: ExportPemParams) => {
    const element = document.createElement("a");
    const file = new Blob([key], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
  };

  //Create a new key pair for the user
  const createKeyPair = async ({
    passphrase,
  }: CreateKeyPair): Promise<KeyPair> => {
    if (user) {
      const { publicKey, privateKey } = await generatePgpKeyPair({
        passphrase,
        name: user.name,
        email: user.email,
      });

      //Upload public key to the server
      await setPublicKey(publicKey);
      //Save the private key to the local storage
      setKeyPair({ publicKey, privateKey });

      console.log("Set public key to the server ok");

      return { publicKey, privateKey };
    } else {
      throw new Error(
        "Fail to create pgp key pair, user information not found"
      );
    }
  };

  //Export the key pair a zip file with .asc files
  const exportAscKeyPair = () => {
    if (keyPair && user) {
      const { publicKey, privateKey } = keyPair;
      return _exportAscKeyPair({ publicKey, privateKey, userId: user.id });
    } else {
      throw new Error(
        "Fail to export pem key pair, key pair or user not found"
      );
    }
  };

  const importAscKeyPair = async (file: File) => {
    if (user) {
      const { publicKey, privateKey } = await _importAscKeyPair(file);
      if (publicKey && privateKey) {
        await setPublicKey(publicKey);
        setKeyPair({ publicKey, privateKey });
        return { publicKey, privateKey };
      } else {
        throw new Error("Fail to import pem key pair, key pair not found");
      }
    } else {
      throw new Error("User not found");
    }
  };

  const openKeyCreator = ({ closeable = false }: OpenKeyCreator) => {
    setIsCloseable(closeable);
    setKeyCreatorOpened(true);
  };

  const openKeyManager = () => {
    setKeyManagerOpened(true);
  };

  const openKeyPassphraseInput = () => {
    setKeyPassphraseInputOpened(true);
  };

  return (
    <>
      <KeyManagerContext.Provider
        value={{
          setPassphrase,
          passphrase,
          keyPair,
          setKeyPair,
          createKeyPair,
          exportAscKeyPair,
          exportToPem,
          importAscKeyPair,
          openKeyCreator,
          openKeyManager,
          openKeyPassphraseInput,
        }}
      >
        <KeyPassphraseInput
          opened={keyPassphraseInputOpened}
          onClose={() => setKeyPassphraseInputOpened(false)}
        />
        <KeyManager
          opened={keyManagerOpened}
          onClose={() => setKeyManagerOpened(false)}
        />
        <KeyCreator
          closeable={isCloseable}
          opened={keyCreatorOpened}
          onClose={() => setKeyCreatorOpened(false)}
        />
        {children}
      </KeyManagerContext.Provider>
    </>
  );
};
