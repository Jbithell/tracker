import { type MetaFunction } from "react-router";
import { TimingPointEditor } from "~/components/TimingPointEditor/TimingPointEditor";
import * as Schema from "~/database/schema.d";
import type { Route } from "./+types/timingPointEditor";

export const meta: MetaFunction = () => {
  return [{ title: "Timing Point Editor" }];
};

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const timingPoints = await context.db.select().from(Schema.TimingPoints);
  return {
    timingPoints,
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
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
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return <TimingPointEditor timingPoints={loaderData.timingPoints} />;
}
