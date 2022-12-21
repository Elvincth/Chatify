import { Card, Text, Spoiler } from "@mantine/core";
import { ParsedKeyView } from "./ParsedKeyView";

interface ArmoredKeyViewProps {
  armoredKey?: string;
  keyName: string;
}

export const ArmoredKeyView = ({
  armoredKey,
  keyName,
}: ArmoredKeyViewProps) => {
  return (
    <Card shadow="sm" p="xl">
      <Text weight={500} size="lg" className="capitalize">
        {keyName}
      </Text>

      {armoredKey ? (
        <>
          <ParsedKeyView armoredKey={armoredKey} />

          <Text mt="xs" color="dimmed" size="xs">
            <Spoiler maxHeight={170} showLabel="Show more" hideLabel="Hide">
              {armoredKey}
            </Spoiler>
          </Text>
        </>
      ) : (
        <Text mt="xs" color="dimmed" size="sm">
          {keyName} is not available.
        </Text>
      )}
    </Card>
  );
};
