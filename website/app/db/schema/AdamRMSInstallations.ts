import { relations, sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { AdamRMSTimeSeries } from "./AdamRMSTimeSeries";
import { nanoid } from "nanoid";

export const AdamRMSInstallations = sqliteTable("adamrmsinstallations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  uuid: text("uuid")
    .unique()
    .$defaultFn(() => nanoid()),
  firstHeardTimestamp: integer("firstheardtimestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  latestHeardTimestamp: integer("latestheardtimestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  rootUrl: text("rooturl").notNull(),
  location: text("location"),
  asn: text("asn"),
  devMode: integer("devmode", { mode: "boolean" }).notNull().default(false),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  userDefinedString: text("userdefinedstring").notNull().default(""),
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

export const AdamRMSInstallationsRelations = relations(
  AdamRMSInstallations,
  ({ many }) => ({
    events: many(AdamRMSTimeSeries),
  })
);
