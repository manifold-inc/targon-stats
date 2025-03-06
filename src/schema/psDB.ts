import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { env } from "@/env.mjs";
import { LuciaAdapter } from "./lucia_adapter";
import { Session, User } from "./schema";

const client = new Client({
  host: env.STATS_DATABASE_HOST,
  username: env.STATS_DATABASE_USERNAME,
  password: env.STATS_DATABASE_PASSWORD,
});

export const statsDB = drizzle(client);
export const adapter = new LuciaAdapter(statsDB, Session, User);
