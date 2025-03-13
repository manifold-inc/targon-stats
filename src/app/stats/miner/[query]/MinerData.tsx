import { and, desc, eq, or, sql } from "drizzle-orm";

import { getMongoDb } from "@/schema/mongoDB";
import { statsDB } from "@/schema/psDB";
import { OrganicRequest } from "@/schema/schema";
import KeysTable from "./KeysTable";
import OrganicResponseComparison from "./OrganicResponseComparison";
import ThroughputStats from "./ThroughputStats";

export interface TargonDoc {
  _id: string;
  uid: number;
  last_updated: number;
  [key: string]:
    | {
        miner_cache?: {
          models_error: string;
          models: Record<string, number>;
        };
        api?: {
          completed: number;
          completedOverTime: number[];
          attempted: number;
          partial: number;
          successRateOverTime: number[];
          avgSuccessRate: number;
          lastReset: string;
        };
        final_weight_after_expo_before_normal?: number;
        final_weight_before_expo?: number;
        formula?: string;
        is_exploiting?: boolean;
        miner_completed?: number;
        miner_success_rate?: number;
        overall_organics?: number;
        safe_mean_scores?: Record<string, number>;
        tested_organics?: Record<string, Array<number | null>>;
      }
    | string
    | number;
}

export const revalidate = 60;

export interface Token {
  text: string;
  logprob: number;
  token_id: number;
  is_usage?: boolean;
}

interface MinerChartProps {
  query: string;
}

enum Cause {
  SKIPPED_EOS_EOT = "SKIPPED_EOS_EOT",
  UNLIKELY_TOKENS = "UNLIKELY_TOKENS",
  EARLY_END = "EARLY_END",
  OVERFIT = "OVERFIT",
  UNLIKELY_TOKEN = "UNLIKELY_TOKEN",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  LOGPROB_RANDOM = "LOGPROB_RANDOM",
  BAD_STREAM = "BAD_STREAM",
  TOO_SHORT = "TOO_SHORT",
  TOO_LONG = "TOO_LONG",
  NO_USAGE = "NO_USAGE",
  INCORRECT_USAGE_DATA = "INCORRECT_USAGE_DATA",
  LOW_SCORE = "LOW_SCORE",
}

enum RequestEndpoint {
  CHAT = "CHAT",
  COMPLETION = "COMPLETION",
}

export interface Response {
  hotkey: string;
  tps: number;
  time_for_all_tokens: number;
  total_time: number;
  time_to_first_token: number;
  verified: boolean;
  validator: string;
  tokens: unknown[];
  error: string;
  cause: Cause;
  messages?:
    | Array<{
        role: string;
        content: string;
      }>
    | string;
  seed: number;
  model: string;
  max_tokens: number;
  temperature: number;
  request_endpoint: RequestEndpoint;
  timestamp: Date;
  r_nanoid: string;
  version: number;
  usage?: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface OrganicResponse {
  id: number;
  th_pub_id: string;
  hotkey: string;
  coldkey?: string;
  uid?: number;
  request_endpoint: RequestEndpoint;
  temperature: number;
  max_tokens: number;
  seed: number;
  model: string;
  total_tokens: number;
  created_at: Date;
  verified: boolean;
  tps: number;
  time_for_all_tokens: number;
  total_time: number;
  time_to_first_token: number;
  error: string;
  cause: Cause;
}

export interface Keys {
  hotkey: string;
  coldkey: string;
}

function serializeMinerDoc(doc: TargonDoc | null): TargonDoc | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as TargonDoc;
}

export default async function MinerChart({ query }: MinerChartProps) {
  try {
    const stats = await statsDB
      .select({
        id: OrganicRequest.id,
        th_pub_id: OrganicRequest.th_pub_id,
        uid: OrganicRequest.uid,
        hotkey: OrganicRequest.hotkey,
        coldkey: OrganicRequest.coldkey,
        request_endpoint: OrganicRequest.request_endpoint,
        temperature: OrganicRequest.temperature,
        max_tokens: OrganicRequest.max_tokens,
        seed: OrganicRequest.seed,
        model: OrganicRequest.model,
        total_tokens: OrganicRequest.total_tokens,
        created_at: OrganicRequest.created_at,
        verified: OrganicRequest.verified,
        tps: OrganicRequest.tps,
        time_for_all_tokens: OrganicRequest.time_for_all_tokens,
        total_time: OrganicRequest.total_time,
        time_to_first_token: OrganicRequest.time_to_first_token,
        error: OrganicRequest.error,
        cause: OrganicRequest.cause,
      })
      .from(OrganicRequest)
      .where(
        and(
          sql`${OrganicRequest.created_at} > NOW() - INTERVAL 2 HOUR`,
          query.length < 5
            ? eq(OrganicRequest.uid, parseInt(query))
            : or(
                eq(OrganicRequest.hotkey, query),
                eq(OrganicRequest.coldkey, query),
              ),
        ),
      )
      .orderBy(desc(OrganicRequest.created_at))
      .limit(100);

    const miners = new Map<number, Keys>();
    stats.forEach((m) => {
      if (
        m.uid !== null &&
        m.uid !== undefined &&
        m.hotkey !== null &&
        m.coldkey !== null
      ) {
        miners.set(m.uid, { hotkey: m.hotkey, coldkey: m.coldkey ?? "" });
      }
    });

    const mongoDb = getMongoDb();
    if (!mongoDb) {
      throw new Error("Failed to connect to MongoDB");
    }

    let targetUid: number | undefined;
    if (query.length >= 5) {
      for (const [uid, keys] of miners.entries()) {
        if (keys.hotkey === query || keys.coldkey === query) {
          targetUid = uid;
          break;
        }
      }
    } else {
      targetUid = parseInt(query);
    }

    let minerDoc: TargonDoc | null = null;

    if (typeof targetUid === "number") {
      const targonCollection = (await mongoDb
        .collection("uid_responses")
        .find({ uid: targetUid })
        .toArray()) as unknown as TargonDoc[];
      minerDoc = targonCollection[0] || null;
    }

    const serializedMinerDoc = serializeMinerDoc(minerDoc);

    return (
      <>
        <div className="flex flex-col gap-4 pt-8">
          <div className="flex-1">
            <KeysTable miners={miners} />
          </div>
          <div className="flex-1 pt-8">
            {stats.length > 0 ? (
              <OrganicResponseComparison
                responses={stats as OrganicResponse[]}
              />
            ) : (
              <div className="rounded-md bg-gray-100 p-4 text-center dark:bg-gray-800">
                No recent organic responses found
              </div>
            )}
          </div>
          <div className="flex-1 pt-8">
            <ThroughputStats throughputStats={serializedMinerDoc} />
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching miner stats:", error);
    return <div>Error loading miner stats. Please try again later.</div>;
  }
}
