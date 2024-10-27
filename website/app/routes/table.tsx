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
import { DateTime } from "luxon";
import {
  IconBrandApple,
  IconBrandGoogleMaps,
  IconChevronLeft,
} from "@tabler/icons-react";
export const meta: MetaFunction = () => {
  return [{ title: "Position History" }];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const events = await db(env.DB)
    .select({
      timestamp: Events.timestamp,
      data: Events.data,
    })
    .from(Events)
    .orderBy(desc(Events.timestamp));

  return json({
    events,
  });
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container fluid p={"md"}>
      <Group>
        <Link to="/">
          <Button leftSection={<IconChevronLeft />}>Back to Map</Button>
        </Link>
        <Title order={1}>Position History</Title>
      </Group>
      {data.events.length === 0 ? (
        <Title>No data available</Title>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Td>Timestamp</Table.Td>
              <Table.Td>Latitude</Table.Td>
              <Table.Td>Longitude</Table.Td>
              <Table.Td>Google Maps</Table.Td>
              <Table.Td>Apple Maps</Table.Td>
              <Table.Td>Heading</Table.Td>
              <Table.Td>Speed</Table.Td>
              <Table.Td>Altitude</Table.Td>
              <Table.Td>Battery</Table.Td>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.events.map((event) => (
              <Table.Tr key={event.timestamp}>
                <Table.Td>
                  {DateTime.fromSeconds(event.timestamp / 1000, {
                    zone: "local",
                  }).toLocaleString(DateTime.DATETIME_MED)}
                </Table.Td>
                <Table.Td>{event.data.location.latitude}</Table.Td>
                <Table.Td>{event.data.location.longitude}</Table.Td>
                <Table.Td>
                  <Link
                    to={`https://www.google.com/maps?q=${event.data.location.latitude},${event.data.location.longitude}`}
                    target="_blank"
                  >
                    <IconBrandGoogleMaps />
                  </Link>
                </Table.Td>
                <Table.Td>
                  <Link
                    to={`https://maps.apple.com/?q=${event.data.location.latitude},${event.data.location.longitude}`}
                    target="_blank"
                  >
                    <IconBrandApple />
                  </Link>
                </Table.Td>
                <Table.Td>{event.data.location.heading}</Table.Td>
                <Table.Td>{event.data.location.speed} m/s</Table.Td>
                <Table.Td>{event.data.location.altitude} m</Table.Td>
                <Table.Td>
                  {event.data.battery.percentage}%
                  {event.data.battery.charging ? " (charging)" : ""}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
