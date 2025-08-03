import { asc, eq } from "drizzle-orm";
import { type MetaFunction } from "react-router";
import { TimingPointEditor } from "~/components/TimingPointEditor/TimingPointEditor";
import * as Schema from "~/database/schema.d";
import type { Route } from "./+types/timingPointEditor";

export const meta: MetaFunction = () => {
  return [{ title: "Timing Point Editor" }];
};

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const timingPoints = await context.db
    .select()
    .from(Schema.TimingPoints)
    .orderBy(asc(Schema.TimingPoints.order));
  return {
    timingPoints,
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();

  if (request.method === "POST") {
    const name = formData.get("name") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const radius = parseInt(formData.get("radius") as string);

    const newTimingPoint = await context.db
      .insert(Schema.TimingPoints)
      .values({ name, latitude, longitude, radius })
      .returning({ id: Schema.TimingPoints.id });
    if (newTimingPoint.length === 0)
      throw new Error("Failed to create timing point");
    return { created: newTimingPoint[0].id };
  } else if (request.method === "DELETE") {
    const id = parseInt(formData.get("id") as string);
    await context.db
      .delete(Schema.TimingPoints)
      .where(eq(Schema.TimingPoints.id, id));
    return { success: true };
  } else if (request.method === "PUT") {
    const id = parseInt(formData.get("id") as string);
    const name = formData.get("name") as string;
    const radius = parseInt(formData.get("radius") as string);
    const order = parseInt(formData.get("order") as string);
    const applicableDatesRaw = formData.get("applicableDates") as string;
    const applicableDates = applicableDatesRaw.split(",").filter(Boolean);
    await context.db
      .update(Schema.TimingPoints)
      .set({
        name,
        radius,
        order,
        applicableDates,
      })
      .where(eq(Schema.TimingPoints.id, id));
    return { success: true };
  }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return <TimingPointEditor timingPoints={loaderData.timingPoints} />;
}
