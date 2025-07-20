import { data, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { and, gte, desc, lte, param } from "drizzle-orm";
import { Events } from "~/database/schema/Events";
import { LiveMap } from "~/components/LiveMap/LiveMap";
import { DateTime } from "luxon";
import type { Route } from "./+types/index";

export const meta: MetaFunction = () => {
  return [{ title: "Tracking" }];
};

export async function loader({ context, params }: Route.LoaderArgs) {
  const refDate = params.date
    ? DateTime.fromISO(params.date).toUTC()
    : DateTime.now().toUTC();

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
        lte(Events.timestamp, refDate.toMillis() + 86400000)
      )
    );

  return data({
    events,
  });
}

export default function Page({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <LiveMap
      zoom={13}
      pins={actionData.events
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
    />
  );
}
