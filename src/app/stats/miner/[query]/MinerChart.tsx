import { and, desc, eq, gte, inArray, or, sql } from "drizzle-orm";

import { db } from "@/schema/db";
import { MinerResponse, Validator, ValidatorRequest } from "@/schema/schema";
import KeysTable from "./KeysTable";
import MinerChartClient from "./MinerChartClient";
import ResponseComparison from "./ResponseComparison";

export const revalidate = 60;

interface MinerChartProps {
  query: string;
  block: number;
  searchParams?: {
    validators?: string;
  };
}

export interface Response {
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
    max_new_tokens: string;
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

interface Keys {
  hotkey: string;
  coldkey: string;
}

export default async function MinerChart({
  query,
  block,
  searchParams = {},
}: MinerChartProps) {
  try {
    const validatorFlags = searchParams.validators || "";

    const [activeValidators, latestBlock] = await Promise.all([
      db
        .select({
          name: Validator.valiName,
          hotkey: Validator.hotkey,
        })
        .from(Validator)
        .innerJoin(
          ValidatorRequest,
          eq(Validator.hotkey, ValidatorRequest.hotkey),
        )
        .where(gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 2 HOUR`))
        .groupBy(Validator.valiName, Validator.hotkey),
      db
        .select({ maxBlock: sql<number>`MAX(${ValidatorRequest.block})` })
        .from(ValidatorRequest)
        .then((result) => result[0]?.maxBlock ?? 0),
    ]);

    const sortedValis = activeValidators
      .map((validator) => validator.name ?? validator.hotkey.substring(0, 5))
      .sort((a, b) => a.localeCompare(b));

    const selectedValidators = sortedValis.filter(
      (_, index) => validatorFlags[index] === "1",
    );

    const startBlock = latestBlock - Math.min(block, 360);

    const inner = db
      .select({
        jaros: sql<number[]>`${MinerResponse.stats}->'$.jaros'`.as("jaros"),
        wps: MinerResponse.wps,
        time_for_all_tokens: MinerResponse.timeForAllTokens,
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
          ...(selectedValidators?.length !== 0
            ? [inArray(Validator.valiName, selectedValidators)]
            : []),
        ),
      )
      .as("inner");

    const innerResponses = db
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
          ...(selectedValidators?.length !== 0
            ? [inArray(Validator.valiName, selectedValidators)]
            : []),
        ),
      )
      .as("innerResponses");

    const [stats, latestResponses] = await Promise.all([
      db.select().from(inner).orderBy(desc(inner.block)),
      db
        .select()
        .from(innerResponses)
        .orderBy(desc(innerResponses.timestamp))
        .limit(10) as Promise<Response[]>,
    ]);

    const orderedStats = stats.reverse().map((stat) => ({
      ...stat,
      wps: stat.wps ?? 0,
      time_for_all_tokens: stat.time_for_all_tokens ?? 0,
    }));

    const miners = new Map<number, Keys>();
    orderedStats.forEach((m) => {
      miners.set(m.uid, { hotkey: m.hotkey, coldkey: m.coldkey });
    });

    return (
      <>
        <MinerChartClient
          minerStats={orderedStats}
          query={query}
          valiNames={selectedValidators}
        />
        <div className="flex flex-col gap-4 pt-8">
          <div className="flex-1">
            <KeysTable miners={miners} />
          </div>
          <div className="flex-1 pt-8">
            <ResponseComparison responses={latestResponses} />
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching miner stats:", error);
    return <div>Error loading miner stats. Please try again later.</div>;
  }
}
