import { Button, Container, Group, Table, Title } from "@mantine/core";
import { IconChevronLeft, IconList } from "@tabler/icons-react";
import { and, asc, between, eq, or, sql } from "drizzle-orm";
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

  const startOfDay = refDate.startOf("day").toMillis();
  const endOfDay = refDate.endOf("day").toMillis();

  // Get all events for the day
  const dailyEvents = context.db.$with("daily_events").as(
    context.db
      .select({
        id: Schema.Events.id,
        timestamp: Schema.Events.timestamp,
        event_latitude:
          sql<number>`json_extract(data, '$.location.latitude')`.as(
            "event_latitude"
          ),
        event_longitude:
          sql<number>`json_extract(data, '$.location.longitude')`.as(
            "event_longitude"
          ),
      })
      .from(Schema.Events)
      .where(between(Schema.Events.timestamp, startOfDay, endOfDay))
  );

  // Get all events that are within the radius of the timing points that are applicable for the day
  const matchingEvents = context.db.$with("matching_events").as(
    context.db
      .select({
        timing_point_id: Schema.TimingPoints.id,
        name: Schema.TimingPoints.name,
        order: Schema.TimingPoints.order,
        event_id: dailyEvents.id,
        timestamp: dailyEvents.timestamp,
      })
      .from(Schema.TimingPoints)
      .innerJoin(dailyEvents, sql`1`)
      .where(
        and(
          sql`EXISTS (
            SELECT 1
            FROM json_each(${Schema.TimingPoints.applicableDates})
            WHERE value = ${urlDate}
          )`,
          sql`(${6371000 * 2} * ASIN(MIN(1.0, SQRT(
            SIN((${dailyEvents.event_latitude} - ${
            Schema.TimingPoints.latitude
          }) * 0.00872664626) *
            SIN((${dailyEvents.event_latitude} - ${
            Schema.TimingPoints.latitude
          }) * 0.00872664626) +
            COS(${Schema.TimingPoints.latitude} * 0.01745329252) *
            COS(${dailyEvents.event_latitude} * 0.01745329252) *
            SIN((${dailyEvents.event_longitude} - ${
            Schema.TimingPoints.longitude
          }) * 0.00872664626) *
            SIN((${dailyEvents.event_longitude} - ${
            Schema.TimingPoints.longitude
          }) * 0.00872664626)
          )))) <= ${Schema.TimingPoints.radius}`
        )
      )
  );

  const rankedEvents = context.db.$with("ranked_events").as(
    context.db
      .select({
        timing_point_id: matchingEvents.timing_point_id,
        name: matchingEvents.name,
        order: matchingEvents.order,
        event_id: matchingEvents.event_id,
        timestamp: matchingEvents.timestamp,
        row_number_asc:
          sql<number>`ROW_NUMBER() OVER(PARTITION BY ${matchingEvents.timing_point_id} ORDER BY ${matchingEvents.timestamp} ASC)`.as(
            "row_number_asc"
          ),
        row_number_desc:
          sql<number>`ROW_NUMBER() OVER(PARTITION BY ${matchingEvents.timing_point_id} ORDER BY ${matchingEvents.timestamp} DESC)`.as(
            "row_number_desc"
          ),
        event_count:
          sql<number>`COUNT(*) OVER(PARTITION BY ${matchingEvents.timing_point_id})`.as(
            "event_count"
          ),
      })
      .from(matchingEvents)
  );

  // Actually run the query
  const timingPointsWithEvents = await context.db
    .with(dailyEvents, matchingEvents, rankedEvents)
    .select({
      timing_point_id: rankedEvents.timing_point_id,
      name: rankedEvents.name,
      order: rankedEvents.order,
      events:
        sql<string>`json_group_array(json_object('id', ${rankedEvents.event_id}, 'timestamp', ${rankedEvents.timestamp}, 'type', CASE WHEN ${rankedEvents.event_count} = 1 THEN 'passage' WHEN ${rankedEvents.row_number_asc} = 1 THEN 'arrival' WHEN ${rankedEvents.row_number_desc} = 1 THEN 'departure' END))`.as(
          "events"
        ),
    })
    .from(rankedEvents)
    .where(
      or(
        eq(rankedEvents.row_number_asc, 1),
        eq(rankedEvents.row_number_desc, 1)
      )
    )
    .groupBy(
      rankedEvents.timing_point_id,
      rankedEvents.name,
      rankedEvents.order
    )
    .orderBy(asc(rankedEvents.order));

  return {
    timingPoints: timingPointsWithEvents as {
      timing_point_id: number;
      name: string;
      order: number;
      events: string;
    }[],
    date: urlDate,
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
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
          {loaderData.timingPoints.map((timingPoint) => {
            const events = JSON.parse(timingPoint.events) as {
              id: number;
              timestamp: number;
              type: "passage" | "arrival" | "departure";
            }[];
            return (
              <div key={timingPoint.timing_point_id}>
                <Title order={3}>{timingPoint.name}</Title>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Time</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {events.map((event) => (
                      <Table.Tr
                        key={`${timingPoint.timing_point_id}-${event.timestamp}-${event.type}`}
                      >
                        <Table.Td>{event.type}</Table.Td>
                        <Table.Td>
                          {DateTime.fromSeconds(event.timestamp / 1000, {
                            zone: "Europe/London",
                          }).toLocaleString(DateTime.DATETIME_MED)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            );
          })}
        </>
      )}
    </Container>
  );
}
