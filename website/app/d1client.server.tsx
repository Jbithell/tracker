import { drizzle } from "drizzle-orm/d1";

export const db = (database: D1Database) =>
  drizzle(database, {
    logger: process.env.NODE_ENV === "production" ? false : true,
  });
