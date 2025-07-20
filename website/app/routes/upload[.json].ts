import {
  ActionFunctionArgs,
  json,
  redirect,
  type LoaderFunctionArgs,
} from "react-router";
import { db } from "../d1client.server";
import { withZod } from "@remix-validated-form/with-zod";
import { number, z as zod } from "zod";
import { GenericObject, validationError } from "remix-validated-form";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { Events } from "~/database/schema/Events";

export const loader = async () => redirect("/");

const validator = withZod(
  zod.object({
    location: zod.object({
      coords: zod.object({
        accuracy: zod.number(),
        longitude: zod.number(),
        altitude: zod.number(),
        heading: zod.number(),
        latitude: zod.number(),
        altitudeAccuracy: zod.number(),
        speed: zod.number(),
      }),
      mocked: zod.boolean(),
      timestamp: zod.number(),
    }),
    battery: zod.object({
      percentage: zod.number(),
      charging: zod.boolean(),
    }),
  })
);

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const { env, cf } = context.cloudflare;
  if (request.method !== "PUT") {
    return json({ message: "Method not allowed" }, 405);
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ message: "Invalid JSON" }, 400);
  }
  const validated = await validator.validate(payload as GenericObject);
  if (validated.error) return validationError(validated.error);

  const insertTimeSeries = await db(env.DB)
    .insert(Events)
    .values({
      timestamp: validated.data.location.timestamp,
      data: {
        location: {
          accuracy: validated.data.location.coords.accuracy,
          longitude: validated.data.location.coords.longitude,
          altitude: validated.data.location.coords.altitude,
          heading: validated.data.location.coords.heading,
          latitude: validated.data.location.coords.latitude,
          altitudeAccuracy: validated.data.location.coords.altitudeAccuracy,
          speed: validated.data.location.coords.speed,
        },
        battery: validated.data.battery,
      },
    });
  if (insertTimeSeries.error)
    return json({ message: insertTimeSeries.error }, 500);
  return json({}, 200);
};
