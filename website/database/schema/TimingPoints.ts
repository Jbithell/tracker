import { integer,real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const TimingPoints = sqliteTable("timing_points", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { mode: "text" }).notNull(),
  applicableDates: text("applicable_dates", { mode: "json" })
    .$type<string[]>()
    .default([]),
  order: integer("order", { mode: "number" }).default(99999).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: integer("radius", { mode: "number" }).default(10).notNull(), // Metres
});
