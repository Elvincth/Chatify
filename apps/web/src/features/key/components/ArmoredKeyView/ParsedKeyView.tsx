import { Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { readKey, Key } from "openpgp";
interface ParsedKeyViewProps {
  armoredKey?: string;
}

export const ParsedKeyView = ({ armoredKey }: ParsedKeyViewProps) => {
  const [parsedKey, setParsedKey] = useState<Key>();

  useEffect(() => {
    if (armoredKey) {
      readKey({ armoredKey }).then((key) => {
        setParsedKey(key);

        // //get user id
        // key.getUserIDs().forEach((id) => {
        //   console.log(id);
        // });
      });
    }
  }, [armoredKey]);

  return (
    <>
      <Text mt="xs" size="md">
        Key type: {parsedKey?.isPrivate() ? "Private key" : "Public key"}
      </Text>

      <Text mt="xs" size="md">
        OpenPGP Version: {parsedKey?.keyPacket.version}
      </Text>

      <Text mt="xs" size="md">
        Fingerprint: {parsedKey?.getFingerprint()}
      </Text>

      <Text mt="xs" size="md">
        Primary key algorithm: {parsedKey?.getAlgorithmInfo().algorithm} (
        {parsedKey?.getAlgorithmInfo().bits} bits)
      </Text>
      <Text mt="xs" size="md">
        KeyId: {parsedKey?.getKeyID().toHex()}
      </Text>

      <Text mt="xs" size="md">
        Primary key creation time: {parsedKey?.getCreationTime().toUTCString()}
      </Text>

      <Text mt="xs" size="md">
        User ID: {parsedKey?.getUserIDs()[0]}
      </Text>
    </>
  );
};
