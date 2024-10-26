import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./app/db/schema/*.ts",
  out: "./migrations",
  driver: "d1",
  dbCredentials: {
    wranglerConfigPath: "wrangler.toml",
    dbName: "DB",
  },
  introspect: {
    casing: "camel",
  },
  verbose: true,
} satisfies Config;
