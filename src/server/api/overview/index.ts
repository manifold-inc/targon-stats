import { and, asc, eq, gte, sql } from "drizzle-orm";

import { MinerResponse, ValidatorRequest } from "@/schema/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const overviewRouter = createTRPCRouter({
  stats: publicProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db
      .select({
        day: sql<string>`DATE(${ValidatorRequest.timestamp})`.mapWith(
          (v: string) => {
            const date = new Date(v);
            const utc = Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes(),
            );
            return utc;
          },
        ),
        wps: sql<number>`AVG(CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL))`.mapWith(
          Number,
        ),
        time_for_all_tokens:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'$.time_for_all_tokens' AS DECIMAL))`.mapWith(
            Number,
          ),
        daily_validated_requests_with_responses:
          sql<number>`COUNT(DISTINCT ${ValidatorRequest.r_nanoid})`.mapWith(
            Number,
          ),
      })
      .from(MinerResponse)
      .innerJoin(
        ValidatorRequest,
        eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
      )
      .where(
        and(
          sql`(${MinerResponse.stats}->'$.verified') = ${true}`,
          gte(
            ValidatorRequest.timestamp,
            sql`NOW() - INTERVAL 30 DAY`,
          ),
        ),
      )
      .groupBy(sql`DATE(${ValidatorRequest.timestamp})`)
      .orderBy(asc(sql`DATE(${ValidatorRequest.timestamp})`))

    return stats;
  }),
});