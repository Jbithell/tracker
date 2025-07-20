import { Button, Container, Group, Table, Text, Title } from "@mantine/core";
import {
  IconBrandApple,
  IconBrandGoogleMaps,
  IconChevronLeft,
} from "@tabler/icons-react";
import { and, desc, gte, lt, lte, sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Link, useFetcher, type MetaFunction } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import { Events } from "~/database/schema/Events";
import type { Route } from "./+types/table";

export const meta: MetaFunction = () => {
  return [{ title: "Position History" }];
};

const pageLength = 50;
export async function loader({ context, request, params }: Route.LoaderArgs) {
  const cursor = params.cursor;
  let refDate = params.date
    ? DateTime.fromFormat(params.date, "yyyy-MM-dd", { zone: "utc" })
    : DateTime.now().toUTC();
  refDate = refDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const events = await context.db
    .select({
      timestamp: Events.timestamp,
      data: Events.data,
      id: Events.id,
    })
    .from(Events)
    .orderBy(desc(Events.id))
    .where(
      and(
        gte(Events.timestamp, refDate.toMillis()),
        lte(Events.timestamp, refDate.toMillis() + 86400000), // 24 hours
        cursor ? lt(Events.id, parseInt(cursor)) : undefined
      )
    )
    .limit(pageLength);

  const count = await context.db
    .select({ count: sql<number>`count(*)` })
    .from(Events);

  return {
    events,
    count: count[0].count,
    date: params.date,
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof loader>();
  const [events, setEvents] = useState(loaderData.events);
  /**
   * Resources in the worker are limited, so we need to use infinite scroll
   **/
  useEffect(() => {
    if (!fetcher.data || fetcher.state === "loading") {
      return;
    }
    // If we have new data - append it
    if (fetcher.data) {
      const newItems = fetcher.data.events;
      setEvents((prevEvents) => [...prevEvents, ...newItems]);
    }
  }, [fetcher.data]);
  const loadNext = () => {
    if (fetcher.state === "loading") return;
    const cursor = events[events.length - 1].id;
    fetcher.load(`/${loaderData.date}/table/${cursor}`);
  };
  return (
    <Container fluid p={"md"}>
      <Group>
        <Link to={`/${loaderData.date}`}>
          <Button leftSection={<IconChevronLeft />}>Back to Map</Button>
        </Link>
        <Title order={1}>Position History</Title>
      </Group>
      {events.length === 0 ? (
        <Title>No data available</Title>
      ) : (
        <>
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
              {events.map((event) => (
                <Table.Tr key={event.id}>
                  <Table.Td>
                    <ClientOnly>
                      {() =>
                        DateTime.fromSeconds(event.timestamp / 1000, {
                          zone: "local",
                        }).toLocaleString(DateTime.DATETIME_MED)
                      }
                    </ClientOnly>
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
                  <Table.Td>{Math.round(event.data.location.heading)}</Table.Td>
                  <Table.Td>
                    {event.data.location.speed.toFixed(2)} m/s
                  </Table.Td>
                  <Table.Td>
                    {Math.round(event.data.location.altitude)} m
                  </Table.Td>
                  <Table.Td>
                    {event.data.battery.percentage}%
                    {event.data.battery.charging ? " (charging)" : ""}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={9}>
                  {loaderData.count === events.length ? (
                    <Text>
                      All {events.length} record{events.length !== 0 ? "s" : ""}{" "}
                      shown
                    </Text>
                  ) : (
                    <Button
                      onClick={() => loadNext()}
                      loading={fetcher.state === "loading"}
                    >
                      {events.length} shown of {loaderData.count} - load more
                    </Button>
                  )}
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </>
      )}
    </Container>
  );
}
