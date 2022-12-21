import {
  Modal,
  ModalProps,
  Stack,
  Button,
  Title,
  Text,
  Alert,
  Divider,
  FileInput,
} from "@mantine/core";
import { IconAlertCircle, IconUpload } from "@tabler/icons";
import { useState } from "react";
import { PasswordInput } from "~/features/auth";
import { useKeyManager } from "~/features/key";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";

interface KeyCreatorProps extends ModalProps {
  closeable?: boolean;
}

export const KeyCreator = ({
  closeable = false,
  ...others
}: KeyCreatorProps) => {
  const {
    createKeyPair,
    exportAscKeyPair,
    importAscKeyPair,
    openKeyManager,
    setPassphrase,
    openKeyPassphraseInput,
  } = useKeyManager();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const form = useForm({
    initialValues: {
      passphrase: "",
    },
    validate: {},
  });

  const handleClose = () => {
    setStep(0);
    form.setValues({
      passphrase: "",
    });
    others.onClose();
  };

  const handleCreateNewKeyPair = async () => {
    setLoading(true);
    try {
      const forgedKeyPair = await createKeyPair({
        passphrase: form.values.passphrase,
      });

      setPassphrase(form.values.passphrase);

      console.log(forgedKeyPair);

      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleImportKeyPair = async () => {
    if (importFile) {
      setImporting(true);
      try {
        await importAscKeyPair(importFile);

        showNotification({
          title: "Success",
          message: "Your key pair has been imported!",
          color: "green",
        });

        // Close the modal
        handleClose();

        // Open the passphrase input to decrypt the private key
        openKeyPassphraseInput();
      } catch (e) {
        console.log(e);
      } finally {
        setImporting(false);
      }
    }
  };

  const step1 = (
    <>
      <Title align="center" className="font-bold">
        Create a key pair for End-to-End Encryption
      </Title>

      <Text align="center" size="lg">
        Create a PGP key pair for end to end encryption of your messages
      </Text>

      <div className="text-[90px] text-center">🔑</div>

      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Warning"
        color="yellow"
      >
        The created key will be stored in your browser&apos;s local storage. If
        you clear your browser&apos;s local storage, you will lose your key.
      </Alert>

      <Button fullWidth loading={loading} onClick={() => setStep(1)}>
        Next
      </Button>

      <Divider my="xs" label="Or" labelPosition="center" />

      <FileInput
        onChange={setImportFile}
        accept=".zip"
        label="Import PGP Key Pair"
        placeholder="PGP Key Pair (.zip)"
        icon={<IconUpload size={14} />}
      />

      <Button
        loading={importing}
        disabled={!importFile}
        onClick={handleImportKeyPair}
        variant="subtle"
        fullWidth
      >
        Import PGP Key Pair
      </Button>
    </>
  );

  const step2 = (
    <>
      <Title align="center" className="font-bold">
        Create a passphrase for your private key
      </Title>
      <Text align="center" size="md">
        Your PGP private key will be encrypted with this password. You will need
        remember this passphrase to decrypt your private key.
      </Text>

      <div className="text-[110px] text-center">🤫</div>

      <form onSubmit={form.onSubmit(() => handleCreateNewKeyPair())}>
        <PasswordInput
          mt="md"
          label="Passphrase"
          placeholder="Your passphrase"
          required
          {...form.getInputProps("passphrase")}
        />

        <Button fullWidth loading={loading} mt="md" type="submit">
          Create Key Pair
        </Button>
      </form>
    </>
  );

  const step3 = (
    <>
      <Title align="center" className="font-bold">
        Almost there!
      </Title>
      <Text align="center" size="md">
        We have created a PGP key pair for you, please save the key in a safe
        place.
      </Text>

      <div className="text-[110px] text-center">👨‍💻</div>

      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Warning"
        color="yellow"
      >
        Also we stored the key in your browser&apos;s local storage. If you
        clear your browser&apos;s local storage, you will lose your key. So make
        sure to save it somewhere safe.
      </Alert>
      <Stack>
        <Button fullWidth mt="xl" onClick={exportAscKeyPair}>
          Download PGP Key Pair
        </Button>

        <Button onClick={handleClose} variant="subtle" fullWidth>
          I&apos;ve saved the key
        </Button>
      </Stack>
    </>
  );

  return (
    <>
      <Modal
        size="lg"
        {...others}
        closeOnClickOutside={closeable}
        withCloseButton={closeable}
        closeOnEscape={closeable}
        onClose={handleClose}
      >
        <Stack p="sm" className="min-h-[530px]" justify="space-between">
          {step === 0 && step1}
          {step === 1 && step2}
          {step === 2 && step3}
        </Stack>
      </Modal>
    </>
  );
};
