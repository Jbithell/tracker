import { relations, sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { AdamRMSInstallations } from "./AdamRMSInstallations";

// Used to track growth of an installation over time
export const AdamRMSTimeSeries = sqliteTable("adamrmstimeseries", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  installationId: integer("installationId"),
  version: text("version").notNull(),
  metaData: text("metadata", { mode: "json" })
    .$type<{
      instances: number | false;
      users: number | false;
      assetsCount: number | false;
      assetsValueUSD: number | false;
      assetsMassKg: number | false;
    }>()
    .default({
      instances: false,
      users: false,
      assetsCount: false,
      assetsValueUSD: false,
      assetsMassKg: false,
    }),
});

export const postsRelations = relations(AdamRMSTimeSeries, ({ one }) => ({
  installation: one(AdamRMSInstallations, {
    fields: [AdamRMSTimeSeries.installationId],
    references: [AdamRMSInstallations.id],
  }),
}));
