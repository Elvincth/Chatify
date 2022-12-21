import {
  Alert,
  Card,
  Modal,
  ModalProps,
  Stack,
  Button,
  Anchor,
  Group,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useKeyManager } from "../hooks";
import { decryptPrivateKey } from "~/utils/crypto";

export const KeyPassphraseInput = (props: ModalProps) => {
  const { openKeyCreator, keyPair, setPassphrase } = useKeyManager();
  const form = useForm({
    initialValues: {
      passphrase: "",
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (keyPair.privateKey) {
      setLoading(true);
      try {
        const decrypted = await decryptPrivateKey({
          privateKeyArmored: keyPair.privateKey,
          passphrase: form.values.passphrase,
        });

        //Update the passphrase in the key manager
        setPassphrase(form.values.passphrase);
        props.onClose();
      } catch (e) {
        //Set error
        form.setErrors({ passphrase: "Invalid passphrase" });
        console.log(e);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        centered
        title="Decrypt your private key"
        size="lg"
        closeOnEscape={false}
        closeOnClickOutside={false}
        withCloseButton={false}
        {...props}
      >
        <form onSubmit={form.onSubmit(() => handleSubmit())}>
          <Stack>
            <PasswordInput
              label="Passphrase"
              placeholder="Your passphrase"
              required
              mt="md"
              {...form.getInputProps("passphrase")}
            />

            <Group position="apart" mt="lg">
              <Anchor
                onClick={() => {
                  props.onClose();
                  openKeyCreator({
                    closeable: false,
                  });
                }}
                component="button"
                type="button"
                size="sm"
              >
                Forgot passphrase? Create a new key pair
              </Anchor>

              <Button type="submit" loading={loading}>
                Decrypt
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
