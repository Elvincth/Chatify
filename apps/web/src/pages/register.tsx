import {
  TextInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Progress,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { PasswordInput, useAuth } from "~/features/auth";
import { Logo } from "~/features/common";

const Register = () => {
  const router = useRouter();
  //The regex requirements for the password

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const form = useForm({
    initialValues: {
      name: "",
      username: "",
      password: "",
      email: "",
    },
    validate: {
      username: (value) => {
        //at least 3 characters
        if (value.length < 3) {
          return "Username must be at least 3 characters";
        }

        //no spaces
        if (value.includes(" ")) {
          return "Username cannot contain spaces";
        }

        //only dashes, underscores, alphanumeric characters, number allowed
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          return "Username can only contain alphanumeric characters, dashes, and underscores";
        }
      },
      email: (value) =>
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email" : null,
      name: (value) =>
        value.length >= 3 ? null : "Name must be at least 3 characters",
      //   password: (val) => {
      //     const errors = requirements
      //       .map((req) => req.regex.test(val))
      //       .filter((meets) => !meets);
      //     return errors.length === 0
      //       ? null
      //       : "Password does not meet requirements";
      //   },
    },
  });

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(form.values);
      router.push("/chat");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container my={40} size={420}>
      <Group position="center" mb="xs">
        <div>
          <Logo size={60} />
        </div>
      </Group>

      <Title align="center" className="font-bold">
        Welcome to Chatify, register with
      </Title>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        Already have an account?{" "}
        <Link href="/login">
          <Anchor size="sm" component="button" type="button">
            Login
          </Anchor>
        </Link>
      </Text>
      <form onSubmit={form.onSubmit(() => handleRegister())}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps("username")}
          />

          <TextInput
            mt="md"
            required
            label="Name"
            placeholder="Your name"
            {...form.getInputProps("name")}
          />

          <TextInput
            mt="md"
            required
            label="Email"
            placeholder="you@example.com"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            mt="md"
            label="Password"
            placeholder="Your password"
            required
            {...form.getInputProps("password")}
          />

          <Button loading={loading} type="submit" fullWidth mt="xl">
            Register
          </Button>
        </Paper>
      </form>
    </Container>
  );
};

export default Register;
