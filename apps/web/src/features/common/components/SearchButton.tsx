import React from 'react';
import { IconSearch } from '@tabler/icons';
import { UnstyledButton, Text, Group, DefaultProps, createStyles, } from '@mantine/core';

interface SearchButtonProps extends DefaultProps, React.ComponentPropsWithoutRef<'button'> {
    onClick(): void;
    label?: string;
}

const useStyles = createStyles((theme) => {
    const isDark = theme.colorScheme === 'dark';

    return {
        root: {
            maxWidth: '100%',
            width: 300,
            height: 40,
            color: isDark ? theme.colors.dark[2] : theme.colors.gray[5],
            backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
            border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]
                }`,
            paddingLeft: theme.spacing.sm,
            paddingRight: 5,
            borderRadius: theme.radius.md,
            '&:hover': {
                backgroundColor:
                    isDark
                        ? theme.fn.rgba(theme.colors.dark[5], 0.85)
                        : theme.fn.rgba(theme.colors.gray[0], 0.35),
            },
        },
    }
});

export function SearchButton({ className, label = "Search", ...others }: SearchButtonProps) {
    const { cx, classes } = useStyles();

    return (
        <UnstyledButton {...others} className={cx(classes.root, className)}>
            <Group spacing="xs">
                <IconSearch size={14} stroke={1.5} />
                <Text size="sm" color="dimmed" pr={80}>
                    {label}
                </Text>
            </Group>
        </UnstyledButton>
    );
}
