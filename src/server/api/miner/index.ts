import { and, desc, eq, gte, inArray, or, sql } from "drizzle-orm";
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
  stats: publicProcedure
    .input(
      z.object({
        query: z.string(),
        block: z.number().optional(),
        valiNames: z.string().array().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { query, block, valiNames } = input;

      const latestBlock = await ctx.db
        .select({ maxBlock: sql<number>`MAX(${ValidatorRequest.block})` })
        .from(ValidatorRequest)
        .then((result) => result[0]?.maxBlock ?? 0);

      const startBlock = latestBlock - Math.min(block!, 360);

      const eqs =
        query.length < 5
          ? [eq(MinerResponse.uid, parseInt(query))]
          : [eq(MinerResponse.hotkey, query), eq(MinerResponse.coldkey, query)];
      const stats = await ctx.db
        .select({
          jaros: sql<number[]>`${MinerResponse.stats}->'$.jaros'`,
          words_per_second:
            sql<number>`CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL)`.mapWith(
              Number,
            ),
          time_for_all_tokens:
            sql<number>`CAST(${MinerResponse.stats}->'$.time_for_all_tokens' AS DECIMAL(65,30))`.mapWith(
              Number,
            ),
          total_time:
            sql<number>`CAST(${MinerResponse.stats}->'$.total_time' AS DECIMAL(65,30))`.mapWith(
              Number,
            ),
          time_to_first_token:
            sql<number>`CAST(${MinerResponse.stats}->'$.time_to_first_token' AS DECIMAL(65, 30))`.mapWith(
              Number,
            ),
          uid: MinerResponse.uid,
          hotkey: MinerResponse.hotkey,
          coldkey: MinerResponse.coldkey,
          block: ValidatorRequest.block,
        })
        .from(MinerResponse)
        .innerJoin(
          ValidatorRequest,
          eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
        )
        .innerJoin(Validator, eq(Validator.hotkey, ValidatorRequest.hotkey))
        .where(
          and(
            gte(ValidatorRequest.block, startBlock),
            or(...eqs),
            ...(valiNames && !valiNames.includes("All Validators")
              ? [inArray(Validator.valiName, valiNames)]
              : []),
          ),
        )
        .orderBy(desc(ValidatorRequest.block));

      const orderedStats = stats.reverse();

      return orderedStats;
    }),
  getResponses: publicProcedure
    .input(
      z.object({
        query: z.string(),
        valiNames: z.string().array().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { query, valiNames } = input;

      const eqs =
        query.length < 5
          ? [eq(MinerResponse.uid, parseInt(query))]
          : [eq(MinerResponse.hotkey, query), eq(MinerResponse.coldkey, query)];
      const results = await ctx.db
        .select({
          response: sql<string>`${MinerResponse.stats}->'$.response'`,
          ground_truth: sql<string>`${ValidatorRequest.ground_truth}->'$.ground_truth'`,
          prompt: sql<string>`${ValidatorRequest.ground_truth}->'$.messages'`,
          hotkey: MinerResponse.hotkey,
          seed: sql<string>`${ValidatorRequest.sampling_params}->'$.seed'`,
          top_k: sql<string>`${ValidatorRequest.sampling_params}->'$.top_k'`,
          top_p: sql<string>`${ValidatorRequest.sampling_params}->'$.top_p'`,
          best_of: sql<string>`${ValidatorRequest.sampling_params}->'$.best_of'`,
          typical_p: sql<string>`${ValidatorRequest.sampling_params}->'$.typical_p'`,
          temperature: sql<string>`${ValidatorRequest.sampling_params}->'$.temperature'`,
          top_n_tokens: sql<string>`${ValidatorRequest.sampling_params}->'$.top_n_tokens'`,
          max_n_tokens: sql<string>`${ValidatorRequest.sampling_params}->'$.max_new_tokens'`,
          repetition_penalty: sql<string>`${ValidatorRequest.sampling_params}->'$.repetition_penalty'`,
          verified: sql<boolean>`${MinerResponse.stats}->'$.verified'`,
          jaros: sql<number[]>`${MinerResponse.stats}->'$.jaros'`,
          validator: sql<string>`${Validator.valiName}`,
          words_per_second:
            sql<number>`CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL(65, 30))`.mapWith(
              Number,
            ),
          time_for_all_tokens:
            sql<number>`CAST(${MinerResponse.stats}->'$.time_for_all_tokens' AS DECIMAL(65,30))`.mapWith(
              Number,
            ),
          total_time:
            sql<number>`CAST(${MinerResponse.stats}->'$.total_time' AS DECIMAL(65,30))`.mapWith(
              Number,
            ),
          time_to_first_token:
            sql<number>`CAST(${MinerResponse.stats}->'$.time_to_first_token' AS DECIMAL(65,30))`.mapWith(
              Number,
            ),
        })
        .from(MinerResponse)
        .innerJoin(
          ValidatorRequest,
          eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
        )
        .innerJoin(Validator, eq(Validator.hotkey, ValidatorRequest.hotkey))
        .where(
          and(
            or(...eqs),
            ...(valiNames && !valiNames.includes("All Validators")
              ? [inArray(Validator.valiName, valiNames)]
              : []),
          ),
        )
        .orderBy(desc(ValidatorRequest.timestamp))
        .limit(10);

      return results;
    }),
});
