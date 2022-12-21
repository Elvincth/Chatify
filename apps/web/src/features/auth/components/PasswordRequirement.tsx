import { Box, Text, Center } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';

interface PasswordRequirementProps {
    meets: boolean
    label: string;
}

export function PasswordRequirement({ meets, label }: PasswordRequirementProps) {
    return (
        <Text color={meets ? 'teal' : 'red'} mt={5} size="sm">
            <Center inline>
                {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
                <Box ml={7}>{label}</Box>
            </Center>
        </Text>
    );
}