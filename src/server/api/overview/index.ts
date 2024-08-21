import { and, eq, gte, asc, sql } from "drizzle-orm";
import { MinerResponse, ValidatorRequest } from "@/schema/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const overviewRouter = createTRPCRouter({
  stats: publicProcedure.query(async ({ ctx }) => {
    // Define the three queries
    const wpsQuery = ctx.db
      .select({
        day: sql<string>`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`.mapWith(
          (v: string) => {
            const date = new Date(v);
            return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
          },
        ),
        wps: sql<number>`AVG(CAST(${MinerResponse.stats}->'wps' AS DECIMAL))`.mapWith(Number),
      })
      .from(MinerResponse)
      .innerJoin(
        ValidatorRequest,
        eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
      )
      .where(
        and(
          eq(sql`CAST(${MinerResponse.stats}->'verified' AS BOOLEAN)`, true),
          gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL '5 DAYS'`),
        ),
      )
      .groupBy(sql`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`)
      .orderBy(asc(sql`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`))
      .limit(5)
      .then(); // Ensure this returns a promise

    const timeForAllTokensQuery = ctx.db
      .select({
        day: sql<string>`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`.mapWith(
          (v: string) => {
            const date = new Date(v);
            return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
          },
        ),
        time_for_all_tokens: sql<number>`AVG(CAST(${MinerResponse.stats}->'time_for_all_tokens' AS DECIMAL))`.mapWith(Number),
      })
      .from(MinerResponse)
      .innerJoin(
        ValidatorRequest,
        eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
      )
      .where(
        and(
          eq(sql`CAST(${MinerResponse.stats}->'verified' AS BOOLEAN)`, true),
          gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL '5 DAYS'`),
        ),
      )
      .groupBy(sql`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`)
      .orderBy(asc(sql`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`))
      .limit(5)
      .then(); // Ensure this returns a promise

    const dailyValidatedRequestsQuery = ctx.db
      .select({
        day: sql<string>`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`.mapWith(
          (v: string) => {
            const date = new Date(v);
            return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
          },
        ),
        daily_validated_requests_with_responses: sql<number>`COUNT(DISTINCT ${ValidatorRequest.r_nanoid})`.mapWith(Number),
      })
      .from(ValidatorRequest)
      .where(
        gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL '5 DAYS'`),
      )
      .groupBy(sql`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`)
      .orderBy(asc(sql`DATE_TRUNC('DAY', ${ValidatorRequest.timestamp})`))
      .limit(5)
      .then(); // Ensure this returns a promise

    // Execute all queries concurrently using Promise.all
    const [wpsData, timeForAllTokensData, dailyValidatedRequestsData] = await Promise.all([
      wpsQuery,
      timeForAllTokensQuery,
      dailyValidatedRequestsQuery,
    ]);

    // Combine the results based on the 'day' field
    const combinedStats = wpsData.map((wpsEntry) => {
      const day = wpsEntry.day;

      // Find the matching entry in the other datasets
      const timeForAllTokensEntry = timeForAllTokensData.find(
        (entry) => entry.day === day
      );
      const dailyValidatedRequestsEntry = dailyValidatedRequestsData.find(
        (entry) => entry.day === day
      );

      return {
        day,
        wps: wpsEntry.wps,
        time_for_all_tokens: timeForAllTokensEntry?.time_for_all_tokens || 0,
        daily_validated_requests_with_responses:
          dailyValidatedRequestsEntry?.daily_validated_requests_with_responses || 0,
      };
    });

    // Return the combined results
    return combinedStats;
  }),
});
