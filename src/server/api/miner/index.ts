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

      const inner = ctx.db
        .select({
          jaros: sql<number[]>`${MinerResponse.stats}->'$.jaros'`.as("jaros"),
          wps: sql<number>`CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL)`
            .mapWith(Number)
            .as("wps"),
          time_for_all_tokens:
            sql<number>`CAST(${MinerResponse.stats}->'$.time_for_all_tokens' AS DECIMAL(65,30))`
              .mapWith(Number)
              .as("time_for_al_tokens"),
          total_time:
            sql<number>`CAST(${MinerResponse.stats}->'$.total_time' AS DECIMAL(65,30))`
              .mapWith(Number)
              .as("total_time"),
          time_to_first_token:
            sql<number>`CAST(${MinerResponse.stats}->'$.time_to_first_token' AS DECIMAL(65, 30))`
              .mapWith(Number)
              .as("time_to_first_token"),
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
            query.length < 5
              ? eq(MinerResponse.uid, parseInt(query))
              : or(
                eq(MinerResponse.hotkey, query),
                eq(MinerResponse.coldkey, query),
              ),
            ...(valiNames?.length !== 0
              ? [inArray(Validator.valiName, valiNames!)]
              : []),
          ),
        )
        .as("inner");
      const stats = await ctx.db
        .select()
        .from(inner)
        .orderBy(desc(inner.block));

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

      const inner = ctx.db
        .select({
          hotkey: MinerResponse.hotkey,
          validator: Validator.valiName,
          stats: MinerResponse.stats,
          sampling_params: ValidatorRequest.sampling_params,
          ground_truth: ValidatorRequest.ground_truth,
          timestamp: ValidatorRequest.timestamp,
        })
        .from(MinerResponse)
        .innerJoin(
          ValidatorRequest,
          eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
        )
        .innerJoin(Validator, eq(Validator.hotkey, ValidatorRequest.hotkey))
        .where(
          and(
            // Helps speed up query
            gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 2 HOUR`),
            query.length < 5
              ? eq(MinerResponse.uid, parseInt(query))
              : or(
                eq(MinerResponse.hotkey, query),
                eq(MinerResponse.coldkey, query),
              ),
            ...(valiNames?.length !== 0
              ? [inArray(Validator.valiName, valiNames!)]
              : []),
          ),
        )
        .as("inner");

      return (await ctx.db
        .select()
        .from(inner)
        .orderBy(desc(inner.timestamp))
        .limit(10)) as Response[];
    }),
});

interface Response {
  hotkey: string;
  validator: string;
  sampling_params: {
    seed: string;
    top_k: string;
    top_p: string;
    best_of: string;
    typical_p: string;
    temperature: string;
    top_n_tokens: string;
    max_n_tokens: string;
    repetition_penalty: string;
  };
  ground_truth: {
    ground_truth: string;
    messages: string;
  };
  stats: {
    response: string;
    verified: boolean;
    jaros: number[];
    wps: number;
    time_for_all_tokens: number;
    total_time: number;
    time_to_first_token: number;
  };
}
