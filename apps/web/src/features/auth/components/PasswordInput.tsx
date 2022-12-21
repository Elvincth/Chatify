import { Progress, Group, PasswordInputProps } from "@mantine/core";
import { PasswordRequirement } from "./PasswordRequirement";
import { PasswordInput as MantinePasswordInput } from "@mantine/core";
import { ChangeEvent, useState } from "react";

interface PasswordRequirementProps
  extends React.ForwardRefExoticComponent<
    PasswordInputProps & React.RefAttributes<HTMLInputElement>
  > {
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordInput = (props: PasswordRequirementProps) => {
  const [value, setValue] = useState("");

  const requirements = [
    { regex: /.{8,}/, label: "At least 8 characters" },
    { regex: /[0-9]/, label: "At least one number" },
    { regex: /[a-z]/, label: "At least one lowercase letter" },
    { regex: /[A-Z]/, label: "At least one uppercase letter" },
    {
      regex: /[$&+,:;=?@#|'<>.^*()%!-]/,
      label: "At least one special character",
    },
  ];

  const calcStrength = (password: string) => {
    let multiplier = password.length > 7 ? 0 : 1;

    requirements.forEach((requirement) => {
      if (!requirement.regex.test(password)) {
        multiplier += 1;
      }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
  };

  const strength = calcStrength(value);

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.regex.test(value)}
    />
  ));

  const strengthBar = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        styles={{ bar: { transitionDuration: "0ms" } }}
        value={
          value.length > 0 && index === 0
            ? 100
            : strength >= ((index + 1) / 4) * 100
            ? 100
            : 0
        }
        color={strength > 80 ? "teal" : strength > 50 ? "yellow" : "red"}
        key={index}
        size={4}
      />
    ));

  return (
    <>
      <MantinePasswordInput
        {...props}
        onChange={(e) => {
          setValue(e.currentTarget.value);
          props.onChange(e);
        }}
      />

      <Group spacing={5} grow mt="xs" mb="md">
        {strengthBar}
      </Group>

      {checks}
    </>
  );
};
