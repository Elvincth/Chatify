import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth } from "~/features/auth";
import { Logo } from "~/features/common";

const Login = () => {
  const { login } = useAuth();
  const router = useRouter();
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await login(form.values);
      console.log(res);
      router.push("/chat");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(() => handleLogin())}>
      <Container my={40} size={420}>
        <Group position="center" mb="xs">
          <div>
            <Logo size={60} />
          </div>
        </Group>

        <Title align="center" className="font-bold">
          Welcome back to Chatify!
        </Title>

        <Text color="dimmed" size="sm" align="center" mt={5}>
          Do not have an account yet?{" "}
          <Link href="/register">
            <Anchor component="button" type="button" size="sm">
              Create account
            </Anchor>
          </Link>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps("username")}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps("password")}
          />

          <Group position="apart" mt="lg">
            {/* <Checkbox label="Remember me" sx={{ lineHeight: 1 }} /> */}
            <Anchor component="button" type="button" size="sm">
              Forgot password?
            </Anchor>
          </Group>

          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Sign in
          </Button>
        </Paper>
      </Container>
    </form>
  );
};

export default Login;
