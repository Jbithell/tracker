import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { db } from "../d1client.server";
import { useLoaderData } from "@remix-run/react";
import { and, gte, desc, lte, param } from "drizzle-orm";
import { Events } from "~/db/schema/Events";
import { LiveMap } from "~/components/LiveMap/LiveMap";
import { DateTime } from "luxon";
export const meta: MetaFunction = () => {
  return [{ title: "Tracking" }];
};

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const refDate = params.date
    ? DateTime.fromISO(params.date).toUTC()
    : DateTime.now().toUTC();

  const events = await db(env.DB)
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

  return json({
    events,
  });
};
export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <LiveMap
      zoom={13}
      pins={data.events
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
