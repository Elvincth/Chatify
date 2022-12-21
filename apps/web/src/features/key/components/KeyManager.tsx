import {
  Alert,
  Card,
  Modal,
  ModalProps,
  Spoiler,
  Stack,
  Text,
  Button,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useKeyManager } from "~/features/key";
import { readPgpArmoredKeys } from "~/utils/crypto";
import { Key } from "openpgp";
import { ArmoredKeyView } from "./ArmoredKeyView";

export const KeyManager = (others: ModalProps) => {
  const { keyPair, openKeyCreator, exportAscKeyPair, passphrase } =
    useKeyManager();
  const [parsedKeyPair, setParsedKeyPair] = useState<{
    publicKey: Key;
    privateKey: Key;
  }>();

  useEffect(() => {
    if (keyPair.privateKey && keyPair.publicKey && passphrase) {
      //read the armored keys in a human readable format using openpgp

      readPgpArmoredKeys({
        publicKeyArmored: keyPair.publicKey,
        privateKeyArmored: keyPair.privateKey,
        passphrase,
      }).then((keyPair) => {
        setParsedKeyPair(keyPair);
        console.log(keyPair);
        //console.log(stringify(keyPair));
      });
    }
  }, [keyPair, passphrase]);

  return (
    <>
      <Modal size="lg" title="Key Manager" {...others}>
        <Stack>
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Warning"
            color="yellow"
          >
            Your key is stored in your browser&apos;s local storage. If you
            clear your browser&apos;s local storage, you will lose your key.
          </Alert>
          <Button fullWidth onClick={exportAscKeyPair}>
            Download PGP Key Pair
          </Button>
          {/* <Button
            fullWidth
            onClick={() => {
              console.clear();
              console.log(parsedKeyPair);
            }}
          >
            Show Parsed Key Pair
          </Button> */}

          <ArmoredKeyView armoredKey={keyPair.publicKey} keyName="Public Key" />

          <ArmoredKeyView
            armoredKey={keyPair.privateKey}
            keyName="Private Key"
          />
          <Card>
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Danger"
              color="red"
            >
              If you generate a new key pair, you will lose your old key pair.
              You will not be able to decrypt older messages.
            </Alert>
            <Button
              onClick={() => {
                openKeyCreator({
                  closeable: true,
                });
                others.onClose();
              }}
              mt="sm"
              color="red"
            >
              Create new key pair
            </Button>
          </Card>
        </Stack>
      </Modal>
    </>
  );
};
