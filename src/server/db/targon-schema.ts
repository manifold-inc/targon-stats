import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const TargonUser = mysqlTable("user", {
  id: serial("id").primaryKey(),
  pubId: varchar("pub_id", { length: 32 }),
  email: varchar("email", { length: 255 }),
  googleId: varchar("google_id", { length: 36 }),
  password: varchar("password", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 32 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  boughtCredits: bigint("bought_credits", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }),
  planId: int("plan_id").notNull(),
  planCredits: bigint("plan_credits", {
    mode: "number",
    unsigned: true,
  })
    .notNull()
    .default(0),
  budget: bigint("budget", {
    mode: "number",
    unsigned: true,
  }).default(0),
  userRole: mysqlEnum("user_role", ["guest", "user", "admin"])
    .notNull()
    .default("guest"),
  emailVerified: boolean("email_verified").notNull().default(false),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
});

export const TrackedMiner = mysqlTable("tracked_miner", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  hotkey: varchar("hotkey", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const TargonSession = mysqlTable("session", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: bigint("user_id", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});
