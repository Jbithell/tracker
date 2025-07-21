import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Events = sqliteTable("events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  timestamp: integer("timestamp", { mode: "number" }).notNull(),
  data: text("data", { mode: "json" })
    .$type<{
      location: {
        accuracy: number;
        longitude: number;
        altitude: number;
        heading: number;
        latitude: number;
        altitudeAccuracy: number | null;
        speed: number;
      };
      battery: {
        percentage: number;
        charging: boolean;
      } | null;
    }>()
    .notNull(),
});
