import { createEnv } from "@t3-oss/env-nextjs";
import { configDotenv } from "dotenv";
import { z } from "zod";

configDotenv({ path: "./../.env" });

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),

    STATS_DATABASE_HOST: z.string(),
    STATS_DATABASE_USERNAME: z.string(),
    STATS_DATABASE_PASSWORD: z.string(),

    HUB_API_ENDPOINT: z.string(),
    VERCEL_URL: z.string(),
  },
  client: {},

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    STATS_DATABASE_HOST: process.env.STATS_DATABASE_HOST,
    STATS_DATABASE_USERNAME: process.env.STATS_DATABASE_USERNAME,
    STATS_DATABASE_PASSWORD: process.env.STATS_DATABASE_PASSWORD,
    HUB_API_ENDPOINT: process.env.HUB_API_ENDPOINT,
    VERCEL_URL: process.env.VERCEL_ENV ?? "http://localhost:3000",
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
