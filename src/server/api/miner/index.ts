import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { MinerResponse, Validator, ValidatorRequest } from "@/schema/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const minerRouter = createTRPCRouter({
  globalAvgStats: publicProcedure
    .input(
      z.object({
        verified: z.boolean(),
        valiNames: z.string().array().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const stats = await ctx.db
        .select({
          minute:
            sql<string>`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`.mapWith(
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
          avg_jaro: sql<number>`
            AVG(
              (SELECT AVG(CAST(jt.value AS DECIMAL))
              FROM JSON_TABLE(${MinerResponse.stats}->'$.jaros', '$[*]' COLUMNS (value DOUBLE PATH '$')) AS jt)
              )`.mapWith(Number),
          avg_wps:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL))`.mapWith(
              Number,
            ),
          avg_time_for_all_tokens:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'$.time_for_all_tokens' AS DECIMAL(8,5)))`.mapWith(
              Number,
            ),
          avg_total_time:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'$.total_time' AS DECIMAL(8,5)))`.mapWith(
              Number,
            ),
          avg_time_to_first_token:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'$.time_to_first_token' AS DECIMAL(8,5)))`.mapWith(
              Number,
            ),
          valiName: Validator.valiName,
        })
        .from(MinerResponse)
        .innerJoin(
          ValidatorRequest,
          eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
        )
        .innerJoin(Validator, eq(Validator.hotkey, ValidatorRequest.hotkey))
        .where(
          and(
            gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 2 HOUR`),
            ...(input.verified
              ? [
                  sql`(${MinerResponse.stats}->'$.verified') = ${input.verified}`,
                ]
              : []),
            ...(input.valiNames && !input.valiNames.includes("All Validators")
              ? [inArray(Validator.valiName, input.valiNames)]
              : []),
          ),
        )
        .groupBy(
          sql`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`,
          Validator.valiName,
        )
        .orderBy(
          sql`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`,
        );

      return stats;
    }),
});
