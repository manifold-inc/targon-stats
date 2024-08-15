import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { MinerResponse, Validator, ValidatorRequest } from "@/schema/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Define the Delegate schema
const DelegateSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string(),
  signature: z.string(),
});

// Define the schema for the entire response
const DelegatesSchema = z.record(z.string(), DelegateSchema);

export const minerRouter = createTRPCRouter({
  globalAvgStats: publicProcedure
    .input(z.object({ verified: z.boolean(), valiName: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      console.log("Input: ", input);
      const stats = await ctx.db
        .select({
          minute:
            sql<string>`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`.mapWith(
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
              AVG((SELECT AVG(value::float) FROM jsonb_array_elements(${MinerResponse.stats}->'jaros')))`.mapWith(
            Number,
          ),
          avg_wps:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'wps' AS DECIMAL))`.mapWith(
              Number,
            ),
          avg_time_for_all_tokens:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'time_for_all_tokens' AS DECIMAL))`.mapWith(
              Number,
            ),
          avg_total_time:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'total_time' AS DECIMAL))`.mapWith(
              Number,
            ),
          avg_time_to_first_token:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'time_to_first_token' AS DECIMAL))`.mapWith(
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
            gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL '2 hours'`),
            gte(ValidatorRequest.version, 22040),
            ...(input.verified
              ? [
                  eq(
                    sql`CAST(${MinerResponse.stats}->'verified' AS BOOLEAN)`,
                    input.verified,
                  ),
                ]
              : []),
            ...(input.valiName && input.valiName !== "All Validators"
              ? [eq(Validator.valiName, input.valiName)]
              : []),
          ),
        )
        .groupBy(
          sql`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`,
          Validator.valiName,
        )
        .orderBy(sql`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`);

      console.log(stats);

      return stats;
    }),
  stats: publicProcedure
    .input(
      z.object({
        query: z.string(),
        block: z.number().optional(),
        valiName: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { query, block, valiName } = input;

      const latestBlock = await ctx.db
        .select({ maxBlock: sql<number>`MAX(${ValidatorRequest.block})` })
        .from(ValidatorRequest)
        .then((result) => result[0]?.maxBlock ?? 0);

      console.log("Latest Block: ", latestBlock);

      const startBlock = latestBlock - Math.min(block!, 360);

      console.log("Start Block: ", startBlock);
      console.log("Vali Name: ", valiName);

      const eqs =
        query.length < 5
          ? [eq(MinerResponse.uid, parseInt(query))]
          : [eq(MinerResponse.hotkey, query), eq(MinerResponse.coldkey, query)];
      const stats = await ctx.db
        .select({
          jaros: sql<number[]>`${MinerResponse.stats}->'jaros'`,
          words_per_second:
            sql<number>`CAST(${MinerResponse.stats}->'wps' AS DECIMAL)`.mapWith(
              Number,
            ),
          time_for_all_tokens:
            sql<number>`CAST(${MinerResponse.stats}->'time_for_all_tokens' AS DECIMAL)`.mapWith(
              Number,
            ),
          total_time:
            sql<number>`CAST(${MinerResponse.stats}->'total_time' AS DECIMAL)`.mapWith(
              Number,
            ),
          time_to_first_token:
            sql<number>`CAST(${MinerResponse.stats}->'time_to_first_token' AS DECIMAL)`.mapWith(
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
            ...(valiName && valiName !== "All Validators"
              ? [eq(Validator.valiName, valiName)]
              : []),
          ),
        )
        .orderBy(desc(ValidatorRequest.block));

      console.log("Stats: ", stats);

      const orderedStats = stats.reverse();
      console.log("Ordered Stats: ", orderedStats);

      return orderedStats;
    }),
  getResponses: publicProcedure
    .input(
      z.object({
        query: z.string(),
        validator: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { query, validator } = input;

      const eqs =
        query.length < 5
          ? [eq(MinerResponse.uid, parseInt(query))]
          : [eq(MinerResponse.hotkey, query), eq(MinerResponse.coldkey, query)];
      const results = await ctx.db
        .select({
          response: sql<string>`${MinerResponse.stats}->'response'`,
          ground_truth: sql<string>`${ValidatorRequest.ground_truth}->'ground_truth'`,
          prompt: sql<string>`${ValidatorRequest.ground_truth}->'messages'`,
          hotkey: MinerResponse.hotkey,
          seed: sql<string>`${ValidatorRequest.sampling_params}->'seed'`,
          top_k: sql<string>`${ValidatorRequest.sampling_params}->'top_k'`,
          top_p: sql<string>`${ValidatorRequest.sampling_params}->'top_p'`,
          best_of: sql<string>`${ValidatorRequest.sampling_params}->'best_of'`,
          typical_p: sql<string>`${ValidatorRequest.sampling_params}->'typical_p'`,
          temperature: sql<string>`${ValidatorRequest.sampling_params}->'temperature'`,
          top_n_tokens: sql<string>`${ValidatorRequest.sampling_params}->'top_n_tokens'`,
          max_n_tokens: sql<string>`${ValidatorRequest.sampling_params}->'max_new_tokens'`,
          repetition_penalty: sql<string>`${ValidatorRequest.sampling_params}->'repetition_penalty'`,
          verified: sql<boolean>`${MinerResponse.stats}->'verified'`,
          jaros: sql<number[]>`${MinerResponse.stats}->'jaros'`,
          validator: sql<string>`${Validator.valiName}`,
          words_per_second:
            sql<number>`CAST(${MinerResponse.stats}->'wps' AS DECIMAL)`.mapWith(
              Number,
            ),
          time_for_all_tokens:
            sql<number>`CAST(${MinerResponse.stats}->'time_for_all_tokens' AS DECIMAL)`.mapWith(
              Number,
            ),
          total_time:
            sql<number>`CAST(${MinerResponse.stats}->'total_time' AS DECIMAL)`.mapWith(
              Number,
            ),
          time_to_first_token:
            sql<number>`CAST(${MinerResponse.stats}->'time_to_first_token' AS DECIMAL)`.mapWith(
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
            ...(validator && validator !== "All Validators"
              ? [eq(Validator.valiName, validator)]
              : []),
          ),
        )
        .orderBy(desc(ValidatorRequest.timestamp))
        .limit(10);

      return results;
    }),
  addDelegates: publicProcedure.mutation(async ({ ctx }) => {
    try {
      // Fetch the delegate data
      const response = await fetch(
        "https://raw.githubusercontent.com/opentensor/bittensor-delegates/main/public/delegates.json",
      );

      if (!response.ok) {
        console.error("[addDelegates] Error: ", response.status);
        return new Response(null, { status: 500 });
      }

      const jsonData: unknown = await response.json();
      const data = DelegatesSchema.parse(jsonData);

      // Process each delegate
      for (const [hotkey, delegate] of Object.entries(data)) {
        await ctx.db
          .insert(Validator)
          .values({
            hotkey: hotkey,
            valiName: delegate.name,
          })
          .onConflictDoUpdate({
            target: [Validator.hotkey],
            set: {
              valiName: delegate.name,
            },
          });
      }

      // Return a success response
      return { success: true };
    } catch (error) {
      console.error("[addDelegates] Error: ", error);
      return { success: false, error: "An error occurred during processing." };
    }
  }),
});
