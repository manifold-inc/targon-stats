import { and, asc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/schema/db";
import { MinerResponse, ValidatorRequest } from "@/schema/schema";
import ClientPage from "./ClientPage";

export default async function Page() {
  try {
    const filteredStats = db
      .select({
        day: sql<string>`DATE(${ValidatorRequest.timestamp})`
          .mapWith((v: string) => {
            const date = new Date(v);
            const utc = Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes(),
            );
            return utc;
          })
          .as("day"),
        wps: sql<number>`AVG(CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL))`
          .mapWith(Number)
          .as("wps"),
        time_for_all_tokens:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'$.time_for_all_tokens' AS DECIMAL))`
            .mapWith(Number)
            .as("time_for_all_tokens"),
        r_nanoid: ValidatorRequest.r_nanoid,
      })
      .from(MinerResponse)
      .innerJoin(
        ValidatorRequest,
        eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
      )
      .where(
        and(
          sql`(${MinerResponse.stats}->'$.verified') = ${true}`,
          gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 5 DAY`),
        ),
      )
      .groupBy(sql`DATE(${ValidatorRequest.timestamp})`)
      .as("filteredStats");

    const stats = await db
      .select({
        day: filteredStats.day,
        wps: filteredStats.wps,
        time_for_all_tokens: filteredStats.time_for_all_tokens,
        daily_validated_requests_with_responses:
          sql<number>`COUNT(${filteredStats.r_nanoid})`.as(
            "daily_validated_requests_with_responses",
          ),
      })
      .from(filteredStats)
      .orderBy(asc(filteredStats.day));

    return <ClientPage stats={stats} />;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return <div>Error loading metrics</div>;
  }
}
