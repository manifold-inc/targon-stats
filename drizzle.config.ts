import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  verbose: true,
  dialect: "mysql",
  schema: "./src/schema/schema.ts",
  dbCredentials: {
    host: process.env.DATABASE_HOST!, 
    user: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!, 
    database: process.env.DATABASE_NAME || "targon-stats",
    ssl: {
      rejectUnauthorized: true,
    }
  },
});
