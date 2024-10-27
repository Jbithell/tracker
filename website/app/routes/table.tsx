import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { db } from "../d1client.server";
import { Link, useLoaderData } from "@remix-run/react";
import { and, eq, gte, isNotNull, lt, max, asc, desc } from "drizzle-orm";
import {
  Button,
  Card,
  Container,
  Group,
  Image,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { Events } from "~/db/schema/Events";
import { LiveMap } from "~/components/LiveMap/LiveMap";
export const meta: MetaFunction = () => {
  return [{ title: "Tracking" }];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const date = new Date();
  date.setDate(date.getDate() - 90);
  const events = await db(env.DB)
    .select({
      timestamp: Events.timestamp,
      data: Events.data,
    })
    .from(Events)
    .orderBy(desc(Events.timestamp))
    .where(and(gte(Events.timestamp, date)));

  return json({
    events,
  });
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container>
      {data.events.length === 0 ? (
        <Title>No data available</Title>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Td>Timestamp</Table.Td>
              <Table.Td>Location</Table.Td>
              <Table.Td>Battery</Table.Td>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.events.map((event) => (
              <Table.Tr key={event.timestamp}>
                <Table.Td>{event.timestamp}</Table.Td>
                <Table.Td>{JSON.stringify(event.data)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
