import { Button, Container, Group, Table, Title } from "@mantine/core";
import { IconChevronLeft, IconList } from "@tabler/icons-react";
import { asc, sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { Link, type MetaFunction } from "react-router";
import * as Schema from "~/database/schema.d";
import type { Route } from "./+types/timingPoints";

export const meta: MetaFunction = () => {
  return [{ title: "Timing Points" }];
};

export async function loader({ context, request, params }: Route.LoaderArgs) {
  let refDate = params.date
    ? DateTime.fromFormat(params.date, "yyyy-MM-dd", { zone: "utc" })
    : DateTime.now().toUTC();
  refDate = refDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const urlDate = refDate.toFormat("yyyy-MM-dd");

  const timingPoints = await context.db
    .select()
    .from(Schema.TimingPoints)
    .orderBy(asc(Schema.TimingPoints.order)).where(sql`EXISTS (
      SELECT 1
      FROM json_each(${Schema.TimingPoints.applicableDates})
      WHERE value = ${urlDate}
    )`); // Selects only timing points that are applicable for the current date

  return {
    timingPoints,
    date: urlDate,
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const headerFooter = (
    <Table.Tr>
      <Table.Td>Name</Table.Td>
    </Table.Tr>
  );
  return (
    <Container fluid p={"md"}>
      <Group>
        <Button
          leftSection={<IconChevronLeft />}
          component={Link}
          to={`/${loaderData.date}`}
        >
          Back to Map
        </Button>
        <Button
          leftSection={<IconList />}
          href={`/${loaderData.date}/table`}
          component="a"
        >
          View Full History
        </Button>
        <Title order={1}>History at Timing Points</Title>
      </Group>
      {loaderData.timingPoints.length === 0 ? (
        <Title>No data available</Title>
      ) : (
        <>
          <Table striped>
            <Table.Thead>{headerFooter}</Table.Thead>
            <Table.Tbody>
              {loaderData.timingPoints.map((timingPoint) => (
                <Table.Tr key={timingPoint.id}>
                  <Table.Td>{timingPoint.name}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>{headerFooter}</Table.Tfoot>
          </Table>
        </>
      )}
    </Container>
  );
}
