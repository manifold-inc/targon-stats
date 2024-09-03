import { and, desc, eq, gte, inArray, or, sql } from "drizzle-orm";

import { db } from "@/schema/db";
import { MinerResponse, Validator, ValidatorRequest } from "@/schema/schema";
import KeysTable from "./KeysTable";
import MinerChartClient from "./MinerChartClient";
import ResponseComparison from "./ResponseComparison";

interface MinerChartProps {
  query: string;
  block: number;
  valiNames: string[];
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
  valiNames,
}: MinerChartProps) {
  try {
    const latestBlock = await db
      .select({ maxBlock: sql<number>`MAX(${ValidatorRequest.block})` })
      .from(ValidatorRequest)
      .then((result) => result[0]?.maxBlock ?? 0);

    const startBlock = latestBlock - Math.min(block, 360);

    const inner = db
      .select({
        jaros: sql<number[]>`${MinerResponse.stats}->'$.jaros'`.as("jaros"),
        wps: sql<number>`CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL)`
          .mapWith(Number)
          .as("wps"),
        time_for_all_tokens:
          sql<number>`CAST(${MinerResponse.stats}->'$.time_for_all_tokens' AS DECIMAL(65,30))`
            .mapWith(Number)
            .as("time_for_all_tokens"),
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
            ? [inArray(Validator.valiName, valiNames)]
            : []),
        ),
      )
      .as("inner");

    const stats = await db.select().from(inner).orderBy(desc(inner.block));

    const orderedStats = stats.reverse();

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
          ...(valiNames?.length !== 0
            ? [inArray(Validator.valiName, valiNames)]
            : []),
        ),
      )
      .as("innerResponses");

    const latestResponses = (await db
      .select()
      .from(innerResponses)
      .orderBy(desc(innerResponses.timestamp))
      .limit(10)) as Response[];

    const miners = new Map<number, Keys>();
    orderedStats.forEach((m) => {
      miners.set(m.uid, { hotkey: m.hotkey, coldkey: m.coldkey });
    });

    return (
      <>
        <MinerChartClient
          minerStats={orderedStats}
          query={query}
          valiNames={valiNames}
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
