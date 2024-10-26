import { Group, Paper, SimpleGrid, Text } from "@mantine/core";
import {
  IconUserPlus,
  IconDiscount2,
  IconReceipt2,
  IconCoin,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";
import classes from "./StatsGrid.module.css";

const icons = {
  user: IconUserPlus,
  discount: IconDiscount2,
  receipt: IconReceipt2,
  coin: IconCoin,
};

export function StatsGrid({
  data,
}: {
  data: Array<{
    title: string;
    icon: keyof typeof icons;
    value: string;
    diff: number | null;
    description: string;
  }>;
}) {
  const stats = data.map((stat) => {
    const Icon = icons[stat.icon];
    const DiffIcon =
      stat.diff === null || stat.diff > 0
        ? IconArrowUpRight
        : IconArrowDownRight;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed" className={classes.title}>
            {stat.title}
          </Text>
          <Icon className={classes.icon} size="1.4rem" stroke={1.5} />
        </Group>

        <Group align="flex-end" gap="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
          {stat.diff === null ? null : (
            <Text
              c={stat.diff > 0 ? "teal" : "red"}
              fz="sm"
              fw={500}
              className={classes.diff}
            >
              <span>{stat.diff}%</span>
              <DiffIcon size="1rem" stroke={1.5} />
            </Text>
          )}
        </Group>

        <Text fz="xs" c="dimmed" mt={7}>
          {stat.description}
        </Text>
      </Paper>
    );
  });
  return (
    <SimpleGrid pt={"md"} pb={"md"} cols={{ base: 1, xs: 2, md: 3 }}>
      {stats}
    </SimpleGrid>
  );
}
