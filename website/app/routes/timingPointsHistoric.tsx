import { Button, Container, Group, Table, Title } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { asc, eq, or, sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { Link, type MetaFunction } from "react-router";
import * as Schema from "~/database/schema.d";
import type { Route } from "./+types/timingPointsHistoric";

export const meta: MetaFunction = () => {
  return [{ title: "Timing Points" }];
};

export async function loader({ context, request, params }: Route.LoaderArgs) {
  let refDate = params.date
    ? DateTime.fromFormat(params.date, "yyyy-MM-dd", { zone: "utc" })
    : DateTime.now().toUTC();
  refDate = refDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const urlDate = refDate.toFormat("yyyy-MM-dd");

  // Select timing points that are applicable on the chosen date
  const selectedTimingPoints = context.db.$with("selected_timing_points").as(
    context.db
      .select({
        id: Schema.TimingPoints.id,
        name: Schema.TimingPoints.name,
        order: Schema.TimingPoints.order,
        latitude: Schema.TimingPoints.latitude,
        longitude: Schema.TimingPoints.longitude,
        radius: Schema.TimingPoints.radius,
        applicableDates: Schema.TimingPoints.applicableDates,
      })
      .from(Schema.TimingPoints)
      .where(
        sql`EXISTS (
          SELECT 1 FROM json_each(${Schema.TimingPoints.applicableDates})
          WHERE value = ${urlDate}
        )`
      )
  );

  // Derive event_date from timestamp; keep only events that fall on applicable dates for the timing point
  const dateEvents = context.db.$with("date_events").as(
    context.db
      .select({
        timing_point_id: selectedTimingPoints.id,
        name: selectedTimingPoints.name,
        order: selectedTimingPoints.order,
        latitude: selectedTimingPoints.latitude,
        longitude: selectedTimingPoints.longitude,
        radius: selectedTimingPoints.radius,
        date: sql<string>`strftime('%Y-%m-%d', ${Schema.Events.timestamp} / 1000, 'unixepoch')`.as(
          "date"
        ),
        event_id: Schema.Events.id,
        timestamp: Schema.Events.timestamp,
        event_latitude:
          sql<number>`json_extract(${Schema.Events.data}, '$.location.latitude')`.as(
            "event_latitude"
          ),
        event_longitude:
          sql<number>`json_extract(${Schema.Events.data}, '$.location.longitude')`.as(
            "event_longitude"
          ),
      })
      .from(selectedTimingPoints)
      .innerJoin(Schema.Events, sql`1`)
      .where(
        sql`EXISTS (
          SELECT 1 FROM json_each(${selectedTimingPoints.applicableDates})
          WHERE value = strftime('%Y-%m-%d', ${Schema.Events.timestamp} / 1000, 'unixepoch')
        )`
      )
  );

  // Filter events that are within the timing point radius for that date
  const matchingEvents = context.db.$with("matching_events").as(
    context.db
      .select({
        timing_point_id: dateEvents.timing_point_id,
        name: dateEvents.name,
        order: dateEvents.order,
        date: dateEvents.date,
        event_id: dateEvents.event_id,
        timestamp: dateEvents.timestamp,
      })
      .from(dateEvents)
      .where(
        sql`(${6371000 * 2} * ASIN(MIN(1.0, SQRT(
          SIN((${dateEvents.event_latitude} - ${
          dateEvents.latitude
        }) * 0.00872664626) *
          SIN((${dateEvents.event_latitude} - ${
          dateEvents.latitude
        }) * 0.00872664626) +
          COS(${dateEvents.latitude} * 0.01745329252) *
          COS(${dateEvents.event_latitude} * 0.01745329252) *
          SIN((${dateEvents.event_longitude} - ${
          dateEvents.longitude
        }) * 0.00872664626) *
          SIN((${dateEvents.event_longitude} - ${
          dateEvents.longitude
        }) * 0.00872664626)
        )))) <= ${dateEvents.radius}`
      )
  );

  // Rank events per timing_point/date to determine arrival/departure
  const rankedEvents = context.db.$with("ranked_events").as(
    context.db
      .select({
        timing_point_id: matchingEvents.timing_point_id,
        name: matchingEvents.name,
        order: matchingEvents.order,
        date: matchingEvents.date,
        event_id: matchingEvents.event_id,
        timestamp: matchingEvents.timestamp,
        row_number_asc:
          sql<number>`ROW_NUMBER() OVER(PARTITION BY ${matchingEvents.timing_point_id}, ${matchingEvents.date} ORDER BY ${matchingEvents.timestamp} ASC)`.as(
            "row_number_asc"
          ),
        row_number_desc:
          sql<number>`ROW_NUMBER() OVER(PARTITION BY ${matchingEvents.timing_point_id}, ${matchingEvents.date} ORDER BY ${matchingEvents.timestamp} DESC)`.as(
            "row_number_desc"
          ),
        event_count:
          sql<number>`COUNT(*) OVER(PARTITION BY ${matchingEvents.timing_point_id}, ${matchingEvents.date})`.as(
            "event_count"
          ),
      })
      .from(matchingEvents)
  );

  // For each timing_point/date, keep only arrival/departure/passage and aggregate
  const timingPointsByDate = await context.db
    .with(selectedTimingPoints, dateEvents, matchingEvents, rankedEvents)
    .select({
      timing_point_id: rankedEvents.timing_point_id,
      name: rankedEvents.name,
      order: rankedEvents.order,
      date: rankedEvents.date,
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
      rankedEvents.order,
      sql`${rankedEvents.date}`
    )
    .orderBy(asc(rankedEvents.order), asc(rankedEvents.date));

  return {
    timingPointsByDate: timingPointsByDate as {
      timing_point_id: number;
      name: string;
      order: number;
      date: string;
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
        <Title order={1}>Compare Timing Points Across Dates</Title>
      </Group>
      {loaderData.timingPointsByDate.length === 0 ? (
        <Title>No data available</Title>
      ) : (
        <Table striped highlightOnHover stickyHeader stickyHeaderOffset={0}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Location</Table.Th>
              {(() => {
                const uniqueDates = Array.from(
                  new Set(loaderData.timingPointsByDate.map((r) => r.date))
                ).sort();
                return uniqueDates.flatMap((d) => [
                  <Table.Th key={`${d}-arr`}>{d} Arrived</Table.Th>,
                  <Table.Th key={`${d}-dep`}>{d} Departed</Table.Th>,
                ]);
              })()}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(() => {
              const uniqueDates = Array.from(
                new Set(loaderData.timingPointsByDate.map((r) => r.date))
              ).sort();
              const groups = loaderData.timingPointsByDate.reduce(
                (
                  acc: Record<
                    number,
                    {
                      name: string;
                      order: number;
                      byDate: Record<
                        string,
                        {
                          id: number;
                          timestamp: number;
                          type: "passage" | "arrival" | "departure";
                        }[]
                      >;
                    }
                  >,
                  row: {
                    timing_point_id: number;
                    name: string;
                    order: number;
                    date: string;
                    events: string;
                  }
                ) => {
                  const events = JSON.parse(row.events) as {
                    id: number;
                    timestamp: number;
                    type: "passage" | "arrival" | "departure";
                  }[];
                  if (!acc[row.timing_point_id]) {
                    acc[row.timing_point_id] = {
                      name: row.name,
                      order: row.order,
                      byDate: {},
                    };
                  }
                  acc[row.timing_point_id].byDate[row.date] = events;
                  return acc;
                },
                {}
              );
              const ordered = Object.entries(groups).sort(
                (a, b) => a[1].order - b[1].order
              );
              return ordered.map(([tpId, info]) => (
                <Table.Tr key={tpId}>
                  <Table.Td>{info.name}</Table.Td>
                  {uniqueDates.flatMap((d) => {
                    const events = info.byDate[d] || [];
                    if (events.length === 0)
                      return [
                        <Table.Td key={`${tpId}-${d}-a`}></Table.Td>,
                        <Table.Td key={`${tpId}-${d}-d`}></Table.Td>,
                      ];
                    if (events.length === 1 && events[0].type === "passage") {
                      return [
                        <Table.Td key={`${tpId}-${d}-a`}>
                          {DateTime.fromSeconds(events[0].timestamp / 1000, {
                            zone: "Europe/London",
                          }).toLocaleString(DateTime.TIME_24_SIMPLE)}
                        </Table.Td>,
                        <Table.Td key={`${tpId}-${d}-d`}></Table.Td>,
                      ];
                    }
                    const arrivalEvent = events.find(
                      (e) => e.type === "arrival"
                    );
                    const departureEvent = events.find(
                      (e) => e.type === "departure"
                    );
                    if (!arrivalEvent || !departureEvent) {
                      return [
                        <Table.Td key={`${tpId}-${d}-a`}></Table.Td>,
                        <Table.Td key={`${tpId}-${d}-d`}></Table.Td>,
                      ];
                    }
                    if (
                      departureEvent.timestamp - arrivalEvent.timestamp <=
                      1000 * 120
                    ) {
                      return [
                        <Table.Td key={`${tpId}-${d}-a`}>
                          {DateTime.fromSeconds(arrivalEvent.timestamp / 1000, {
                            zone: "Europe/London",
                          }).toLocaleString(DateTime.TIME_24_SIMPLE)}
                        </Table.Td>,
                        <Table.Td key={`${tpId}-${d}-d`}></Table.Td>,
                      ];
                    }
                    return [
                      <Table.Td key={`${tpId}-${d}-a`}>
                        {DateTime.fromSeconds(arrivalEvent.timestamp / 1000, {
                          zone: "Europe/London",
                        }).toLocaleString(DateTime.TIME_24_SIMPLE)}
                      </Table.Td>,
                      <Table.Td key={`${tpId}-${d}-d`}>
                        {DateTime.fromSeconds(departureEvent.timestamp / 1000, {
                          zone: "Europe/London",
                        }).toLocaleString(DateTime.TIME_24_SIMPLE)}
                      </Table.Td>,
                    ];
                  })}
                </Table.Tr>
              ));
            })()}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
