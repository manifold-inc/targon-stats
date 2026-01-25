import { createEnv } from "@t3-oss/env-nextjs";
import { configDotenv } from "dotenv";
import { z } from "zod";

configDotenv({ path: "./../.env" });

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),
    MONGO_URI: z.string(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
