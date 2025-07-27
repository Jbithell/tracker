import { Center, Stack, Title } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { and, desc, gte, lte } from "drizzle-orm";
import { DateTime } from "luxon";
import { useNavigate, type MetaFunction } from "react-router";
import { LiveMap } from "~/components/LiveMap/LiveMap";
import { Events } from "~/database/schema/Events";
import type { Route } from "./+types/map";

export const meta: MetaFunction = () => {
  return [{ title: "Tracking" }];
};

export async function loader({ context, params }: Route.LoaderArgs) {
  let refDate = params.date
    ? DateTime.fromFormat(params.date, "yyyy-MM-dd", { zone: "utc" })
    : DateTime.now().toUTC();
  refDate = refDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const urlDate = refDate.toFormat("yyyy-MM-dd");

  const events = await context.db
    .select({
      timestamp: Events.timestamp,
      data: Events.data,
    })
    .from(Events)
    .orderBy(desc(Events.timestamp))
    .where(
      and(
        gte(Events.timestamp, refDate.toMillis()),
        lte(Events.timestamp, refDate.toMillis() + 86400000) // 24 hours
      )
    );

  return {
    date: refDate.toISO(),
    events,
    urlDate,
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  if (loaderData.events.length === 0) {
    return (
      <Center>
        <Stack>
          <Title order={1} py="xl" px="xl">
            No data received{" "}
            {loaderData.date
              ? DateTime.fromISO(loaderData.date).toFormat("yyyy-MM-dd")
              : undefined}
          </Title>
          <DatePicker
            onChange={(value) => {
              if (value) {
                navigate(
                  `/${DateTime.fromJSDate(value).toFormat("yyyy-MM-dd")}`
                );
              }
            }}
            maxDate={DateTime.now()
              .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
              .toJSDate()}
            value={
              loaderData.date
                ? DateTime.fromISO(loaderData.date).toJSDate()
                : undefined
            }
          />
        </Stack>
      </Center>
    );
  }
  return (
    <LiveMap
      zoom={13}
      pins={loaderData.events
        .filter(
          (event) =>
            "latitude" in event.data.location &&
            "longitude" in event.data.location
        )
        .map((event) => ({
          latitude: event.data.location.latitude,
          longitude: event.data.location.longitude,
          timestamp: event.timestamp,
        }))}
      urlDate={loaderData.urlDate}
    />
  );
}
