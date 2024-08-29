import { sql } from "drizzle-orm";
import {
  boolean,
  float,
  int,
  json,
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

export const ValidatorRequest = mysqlTable("validator_request", {
  r_nanoid: varchar("r_nanoid", { length: 255 }).primaryKey(),
  block: int("block").notNull(),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
  sampling_params: json("sampling_params"),
  ground_truth: json("ground_truth"),
  version: int("version").notNull(),
  hotkey: varchar("hotkey", { length: 255 }),
});

export const MinerResponse = mysqlTable("miner_response", {
  id: int("id").primaryKey().autoincrement(),
  r_nanoid: varchar("r_nanoid", { length: 255 }).notNull(),
  hotkey: varchar("hotkey", { length: 255 }).notNull(),
  coldkey: varchar("coldkey", { length: 255 }).notNull(),
  uid: int("uid").notNull(),
  stats: json("stats"),
});

export const Validator = mysqlTable("validator", {
  hotkey: varchar("hotkey", { length: 255 }).primaryKey(),
  valiName: varchar("vali_name", { length: 255 }),
});

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

export const OrganicRequest = mysqlTable("organic_request", {
  id: int("id").primaryKey().autoincrement(),
  pubId: varchar("pub_id", { length: 255 }),
  userId: varchar("user_id", { length: 32 }).notNull(),
  creditsUsed: int("credits_used").notNull().default(0),
  tokens: int("tokens").notNull().default(0),
  request: json("request").notNull(),
  response: text("response"),
  model: varchar("model_id", { length: 128 }).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  uid: int("uid"),
  hotkey: varchar("hotkey", { length: 255 }),
  coldkey: varchar("coldkey", { length: 255 }),
  minerAddress: varchar("miner_address", { length: 255 }),
  attempt: varchar("attempt", { length: 255 }),
  metadata: json("metadata"),
  scored: boolean("scored").default(false),
  jaro: float("jaro"),
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

export const CheckoutSessions = mysqlTable("checkoutSessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 32 }).notNull(),
  credits: int("credits").notNull().default(DEFAULT_CREDITS),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const Model = mysqlTable("model", {
  id: varchar("id", { length: 128 }).primaryKey(),
  miners: int("miners").default(0).notNull(),
  success: int("success").default(0).notNull(),
  failure: int("failure").default(0).notNull(),
  cpt: int("cpt").default(1).notNull(), // cpt: credits per token
  enabled: boolean("enabled").default(true),
});
