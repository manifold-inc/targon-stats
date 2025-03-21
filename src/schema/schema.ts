import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  float,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { customAlphabet } from "nanoid";

import { DEFAULT_CREDITS } from "@/constants";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz");
export const genId = {
  user: () => "u_" + nanoid(30),
  session: () => "s_" + nanoid(30),
  apikey: () => "sn4_" + nanoid(28),
  organicRequest: () => "oreq_" + nanoid(27),
};

export const ValidatorRequest = mysqlTable(
  "validator_request",
  {
    r_nanoid: varchar("r_nanoid", { length: 48 }).primaryKey(),
    block: int("block").notNull(),
    messages: json("messages").notNull(),
    request_endpoint: mysqlEnum("request_endpoint", [
      "CHAT",
      "COMPLETION",
    ]).notNull(),
    version: int("version").notNull(),
    hotkey: varchar("hotkey", { length: 255 }),
    timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
    model: varchar("model", { length: 65 }).notNull(),
    seed: int("seed"),
    max_tokens: int("max_tokens"),
    temperature: float("temperature"),
  },
  (table) => {
    return {
      idxTimestampHotkey: index("idx_validator_request_timestamp_hotkey").on(
        table.timestamp,
        table.hotkey,
      ),
      idxBlock: index("idx_validator_request_block").on(table.block),
    };
  },
);

export const MinerResponse = mysqlTable(
  "miner_response",
  {
    id: int("id").primaryKey().autoincrement().notNull(),
    r_nanoid: varchar("r_nanoid", { length: 48 }).notNull(),
    hotkey: varchar("hotkey", { length: 255 }).notNull(),
    coldkey: varchar("coldkey", { length: 255 }).notNull(),
    uid: int("uid").notNull(),
    verified: boolean("verified").notNull(),
    timeToFirstToken: float("time_to_first_token").notNull(),
    timeForAllTokens: float("time_for_all_tokens").notNull(),
    totalTime: float("total_time").notNull(),
    tps: float("tps").notNull(),
    tokens: json("tokens"),
    totalTokens: int("total_tokens")
      .generatedAlwaysAs(sql`(COALESCE(JSON_LENGTH(tokens), 0))`)
      .notNull(),
    error: text("error"),
    timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
    cause: mysqlEnum("cause", [
      "SKIPPED_EOS_EOT",
      "UNLIKELY_TOKENS",
      "EARLY_END",
      "OVERFIT",
      "UNLIKELY_TOKEN",
      "INTERNAL_ERROR",
      "LOGPROB_RANDOM",
      "BAD_STREAM",
      "TOO_SHORT",
      "TOO_LONG",
    ]),
  },
  (table) => {
    return {
      idxVerified: index("idx_miner_response_verified").on(table.verified),
      idxUid: index("idx_miner_response_uid").on(table.uid),
      idxRNanoid: index("idx_r_nanoid").on(table.r_nanoid),
      idxHotkey: index("idx_miner_response_hotkey").on(table.hotkey),
      idxColdkey: index("idx,miner_response_coldkey").on(table.coldkey),
      idxTimestamp: index("idx_miner_response_timestamp").on(table.timestamp),
    };
  },
);

export const MinerResponseHistoricalStats = mysqlTable(
  "miner_response_historical_stats",
  {
    id: int("id").primaryKey().autoincrement().notNull(),
    date: date("date").notNull(),
    avgTimeToFirstToken: float("avg_time_to_first_token").notNull(),
    avgTimeForAllTokens: float("avg_time_for_all_tokens").notNull(),
    avgTotalTime: float("avg_total_time").notNull(),
    avgTPS: float("avg_tps").notNull(),
    totalTokens: int("total_tokens").notNull(),
  },
  (table) => {
    return {
      idxDate: index("idx_miner_response_daily_average_date").on(table.date),
    };
  },
);

export const Validator = mysqlTable(
  "validator",
  {
    hotkey: varchar("hotkey", { length: 255 }).primaryKey(),
    valiName: varchar("vali_name", { length: 255 }).default(
      "Unknown Validator",
    ),
    models: json("models").$type<string[]>().notNull().default([]),
    scores: json("scores")
      .$type<Record<string, number>>()
      .notNull()
      .default({}),
    lastUpdated: timestamp("last_updated")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (table) => {
    return {
      valiNameIdx: index("vali_name_idx").on(table.valiName),
    };
  },
);

export const User = mysqlTable("user", {
  id: varchar("id", { length: 32 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique(),
  googleId: varchar("google_id", { length: 36 }).unique(),
  emailConfirmed: boolean("email_confirmed").notNull().default(true),
  password: varchar("password", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 32 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  credits: int("credits").notNull().default(DEFAULT_CREDITS),
});

export const ApiKey = mysqlTable("api_key", {
  key: varchar("id", { length: 32 }).primaryKey(),
  userId: varchar("user_id", { length: 32 }).notNull(),
});

export const Session = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 32 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const OrganicRequest = mysqlTable("organic_requests", {
  id: int("id").autoincrement().notNull(),
  th_pub_id: varchar("th_pub_id", { length: 32 }),
  request_endpoint: mysqlEnum("request_endpoint", [
    "CHAT",
    "COMPLETION",
  ]).notNull(),
  temperature: float("temperature"),
  max_tokens: int("max_tokens"),
  seed: int("seed"),
  model: varchar("model", { length: 255 }),
  total_tokens: int("total_tokens"),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  hotkey: varchar("hotkey", { length: 255 }),
  coldkey: varchar("coldkey", { length: 255 }),
  uid: int("uid"),
  verified: boolean("verified"),
  time_to_first_token: float("time_to_first_token"),
  time_for_all_tokens: float("time_for_all_tokens"),
  total_time: float("total_time"),
  tps: float("tps"),
  error: text("error"),
  cause: mysqlEnum("cause", [
    "SKIPPED_EOS_EOT",
    "UNLIKELY_TOKENS",
    "EARLY_END",
    "OVERFIT",
    "UNLIKELY_TOKEN",
    "INTERNAL_ERROR",
    "LOGPROB_RANDOM",
    "BAD_STREAM",
    "TOO_SHORT",
    "TOO_LONG",
  ]),
});
