import { Center } from "@mantine/core";
import type { InferSelectModel } from "drizzle-orm";
import { ClientOnly } from "remix-utils/client-only";
import * as Schema from "~/database/schema.d";
import { TimingPointEditor as TimingPointEditorClient } from "./TimingPointEditor.client";
export interface TimingPointEditorProps {
  timingPoints: InferSelectModel<typeof Schema.TimingPoints>[];
}
export const TimingPointEditor = (props: TimingPointEditorProps) => (
  <ClientOnly fallback={<Center></Center>}>
    {() => <TimingPointEditorClient {...props} />}
  </ClientOnly>
);
