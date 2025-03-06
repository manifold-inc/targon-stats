import { and, desc, eq, gte, inArray, or, sql } from "drizzle-orm";

import { getMongoDb } from "@/schema/mongoDB";
import { statsDB } from "@/schema/psDB";
import {
  MinerResponse,
  OrganicRequest,
  Validator,
  ValidatorRequest,
} from "@/schema/schema";
import KeysTable from "./KeysTable";
import MinerChartClient from "./MinerChartClient";
import OrganicResponseComparison from "./OrganicResponseComparison";
import ResponseComparison from "./ResponseComparison";

interface TargonDoc {
  _id: string;
  uid: number;
  last_updated: number;
  models: string[];
  gpus: {
    h100: number;
    h200: number;
  };
  [key: string]:
    | {
        miner_cache: {
          weight: number;
          nodes_endpoint_error: string | null;
          models: string[];
          gpus: {
            h100: number;
            h200: number;
          } | null;
        };
      }
    | string
    | number
    | string[]
    | { h100: number; h200: number };
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
  block: number;
  searchParams?: {
    validators?: string;
  };
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
  hotkey: string;
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

interface Keys {
  hotkey: string;
  coldkey: string;
}

function extractUsageData(
  chunks: unknown[],
):
  | { completion_tokens: number; prompt_tokens: number; total_tokens: number }
  | undefined {
  if (!Array.isArray(chunks)) return undefined;

  const lastChunk = chunks[chunks.length - 1];
  if (
    lastChunk &&
    typeof lastChunk === "object" &&
    "usage" in lastChunk &&
    lastChunk.usage &&
    typeof lastChunk.usage === "object" &&
    "completion_tokens" in lastChunk.usage &&
    "prompt_tokens" in lastChunk.usage &&
    "total_tokens" in lastChunk.usage
  ) {
    return lastChunk.usage as {
      completion_tokens: number;
      prompt_tokens: number;
      total_tokens: number;
    };
  }

  return undefined;
}

export default async function MinerChart({
  query,
  block,
  searchParams = {},
}: MinerChartProps) {
  try {
    const validatorFlags = searchParams.validators || "";

    const [activeValidators, latestBlock] = await Promise.all([
      statsDB
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
      statsDB
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

    const inner = statsDB
      .select({
        tps: MinerResponse.tps,
        time_for_all_tokens: MinerResponse.timeForAllTokens,
        time_to_first_token: MinerResponse.timeToFirstToken,
        total_time: MinerResponse.totalTime,
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

    const innerSyntheticResponses = statsDB
      .select({
        id: MinerResponse.id,
        hotkey: MinerResponse.hotkey,
        tps: MinerResponse.tps,
        time_for_all_tokens: MinerResponse.timeForAllTokens,
        total_time: MinerResponse.totalTime,
        time_to_first_token: MinerResponse.timeToFirstToken,
        tokens: MinerResponse.tokens,
        verified: MinerResponse.verified,
        error: MinerResponse.error,
        cause: MinerResponse.cause,
        validator: Validator.valiName,
        messages: ValidatorRequest.messages,
        seed: ValidatorRequest.seed,
        model: ValidatorRequest.model,
        max_tokens: ValidatorRequest.max_tokens,
        temperature: ValidatorRequest.temperature,
        request_endpoint: ValidatorRequest.request_endpoint,
        r_nanoid: ValidatorRequest.r_nanoid,
        version: ValidatorRequest.version,
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
      .as("innerSyntheticResponses");

    const innerOrganicResponses = statsDB
      .select({
        id: OrganicRequest.id,
        hotkey: OrganicRequest.hotkey,
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
          gte(OrganicRequest.created_at, sql`NOW() - INTERVAL 2 HOUR`),
          query.length < 5
            ? eq(OrganicRequest.uid, parseInt(query))
            : or(
                eq(OrganicRequest.hotkey, query),
                eq(OrganicRequest.coldkey, query),
              ),
        ),
      )
      .as("innerOrganicResponses");

    const [stats, latestSyntheticResponses, latestOrganicResponses] =
      await Promise.all([
        statsDB.select().from(inner).orderBy(desc(inner.block)),
        statsDB
          .select()
          .from(innerSyntheticResponses)
          .orderBy(desc(innerSyntheticResponses.id))
          .limit(100)
          .then((responses) => {
            return responses.map((response) => {
              const usage = Array.isArray(response.tokens)
                ? extractUsageData(response.tokens)
                : undefined;

              return {
                ...response,
                tokens: response.tokens,
                usage,
              };
            });
          }) as Promise<Response[]>,
        statsDB
          .select()
          .from(innerOrganicResponses)
          .orderBy(desc(innerOrganicResponses.id))
          .limit(100) as Promise<OrganicResponse[]>,
      ]);

    const orderedStats = stats.reverse().map((stat) => ({
      ...stat,
    }));

    const miners = new Map<number, Keys>();
    orderedStats.forEach((m) => {
      miners.set(m.uid, { hotkey: m.hotkey, coldkey: m.coldkey });
    });

    const gpuStats = {
      avg: { h100: 0, h200: 0 },
      endpoints: [] as Array<{
        name: string;
        gpus: { h100: number; h200: number };
      }>,
    };

    try {
      const mongoDb = getMongoDb();
      if (!mongoDb) {
        throw new Error("Failed to connect to MongoDB");
      }

      // First find the UID if we're querying by hotkey/coldkey
      let targetUid: number | undefined;
      if (query.length >= 5) {
        // Query is hotkey/coldkey, find the UID from our stats
        for (const [uid, keys] of miners.entries()) {
          if (keys.hotkey === query || keys.coldkey === query) {
            targetUid = uid;
            break;
          }
        }
      } else {
        // Query is UID
        targetUid = parseInt(query);
      }

      if (targetUid) {
        const targonCollection = (await mongoDb
          .collection("uid_responses")
          .find({ uid: targetUid })
          .toArray()) as unknown as TargonDoc[];

        const minerDoc = targonCollection[0];

        if (minerDoc) {
          // Add base GPU stats from the document
          if (minerDoc.gpus) {
            gpuStats.endpoints.push({
              name: "base",
              gpus: {
                h100: minerDoc.gpus.h100 || 0,
                h200: minerDoc.gpus.h200 || 0,
              },
            });
          }

          // Add GPU stats from all API endpoints
          Object.entries(minerDoc).forEach(([key, value]) => {
            if (
              key !== "gpus" && // Skip the base gpus field
              key !== "_id" && // Skip MongoDB _id
              key !== "uid" && // Skip uid
              key !== "last_updated" && // Skip last_updated
              key !== "models" && // Skip models
              typeof value === "object" &&
              value !== null &&
              "miner_cache" in value &&
              value.miner_cache?.gpus
            ) {
              const gpus = value.miner_cache.gpus;
              gpuStats.endpoints.push({
                name: key,
                gpus: {
                  h100: gpus.h100 || 0,
                  h200: gpus.h200 || 0,
                },
              });
            }
          });

          // Calculate averages
          if (gpuStats.endpoints.length > 0) {
            gpuStats.avg = {
              h100: Math.round(
                gpuStats.endpoints.reduce(
                  (acc, endpoint) => acc + endpoint.gpus.h100,
                  0,
                ) / gpuStats.endpoints.length,
              ),
              h200: Math.round(
                gpuStats.endpoints.reduce(
                  (acc, endpoint) => acc + endpoint.gpus.h200,
                  0,
                ) / gpuStats.endpoints.length,
              ),
            };
          }
        }
      }
    } catch (error) {
      console.error("Error calculating GPU stats:", error);
    }

    return (
      <>
        <MinerChartClient
          minerStats={orderedStats}
          query={query}
          valiNames={selectedValidators}
          gpuStats={gpuStats}
        />
        <div className="flex flex-col gap-4 pt-8">
          <div className="flex-1">
            <KeysTable miners={miners} />
          </div>
          <div className="flex-1 pt-8">
            <ResponseComparison responses={latestSyntheticResponses} />
          </div>
          <div className="flex-1 pt-8">
            <OrganicResponseComparison responses={latestOrganicResponses} />
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching miner stats:", error);
    return <div>Error loading miner stats. Please try again later.</div>;
  }
}
