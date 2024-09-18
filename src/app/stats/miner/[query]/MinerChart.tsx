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
  tps: number;
  time_for_all_tokens: number;
  total_time: number;
  time_to_first_token: number;
  verified: boolean;
  validator: string;
  tokens: [string, number][];
  vali_request: {
    seed: number;
    model: string;
    stream: boolean;
    messages?: Array<{
      role: string;
      content: string;
    }>;
    prompt?: string;
    max_tokens: number;
    temperature: number;
  };
  request_endpoint: string;
  timestamp: Date;
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
        tps: MinerResponse.tps,
        time_for_all_tokens: MinerResponse.timeForAllTokens,
        total_time: MinerResponse.totalTime,
        time_to_first_token: MinerResponse.timeToFirstToken,
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
        tps: MinerResponse.tps,
        time_for_all_tokens: MinerResponse.timeForAllTokens,
        total_time: MinerResponse.totalTime,
        time_to_first_token: MinerResponse.timeToFirstToken,
        tokens: MinerResponse.tokens,
        verified: MinerResponse.verified,
        validator: Validator.valiName,
        vali_request: ValidatorRequest.vali_request,
        request_endpoint: ValidatorRequest.request_endpoint,
        timestamp: MinerResponse.timestamp,
      })
      .from(MinerResponse)
      .innerJoin(
        ValidatorRequest,
        eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
      )
      .innerJoin(Validator, eq(Validator.hotkey, ValidatorRequest.hotkey))
      .where(
        and(
          gte(MinerResponse.timestamp, sql`NOW() - INTERVAL 2 HOUR`),
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
