import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  verbose: true,
  dialect: "mysql",
  schema: "./src/schema/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
