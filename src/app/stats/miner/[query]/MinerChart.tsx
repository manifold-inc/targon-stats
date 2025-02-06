import { and, desc, eq, gte, inArray, or, sql } from "drizzle-orm";

import { db } from "@/schema/db";
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
  parsedTokens: Token[];
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

interface StreamingChunk {
  choices: Array<{
    delta: {
      content: string | null;
      role?: string;
      tool_calls?: Array<{
        function: {
          arguments: string;
        };
      }>;
    };
    logprobs: {
      content: Array<{
        token: string;
        logprob: number;
        bytes?: number[];
      }> | null;
    } | null;
  }>;
}

interface CompletionChunk {
  id: string;
  model: string;
  object: "text_completion";
  choices: Array<{
    text: string;
    index: number;
    logprobs: {
      tokens: string[];
      token_logprobs: number[];
      text_offset: number[];
    };
    stop_reason: string | null;
    finish_reason: string | null;
  }>;
  created: number;
  system_fingerprint: string | null;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  } | null;
}

interface UsageChunk {
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

function isStreamingOrCompletionChunk(
  chunk: unknown,
): chunk is StreamingChunk | CompletionChunk {
  if (!chunk || typeof chunk !== "object") return false;
  const maybeChunk = chunk as { choices?: unknown };
  return "choices" in maybeChunk && Array.isArray(maybeChunk.choices);
}

function parseStreamingChunk(
  chunk: StreamingChunk | CompletionChunk | UsageChunk,
  requestType: RequestEndpoint,
): Token | null {
  try {
    if (!chunk || typeof chunk !== "object") return null;

    // Skip usage objects - we'll handle them separately
    if ("usage" in chunk && chunk.usage !== null) return null;

    // Only proceed if it's a streaming or completion chunk
    if (!isStreamingOrCompletionChunk(chunk)) return null;

    const choices = chunk.choices;
    if (!choices?.length) return null;

    const choice = choices[0];
    if (!choice || typeof choice !== "object") return null;

    if (requestType === RequestEndpoint.CHAT) {
      if (!("delta" in choice)) return null;
      const delta = choice.delta;
      if (!delta || typeof delta !== "object") return null;

      // Skip assistant role messages without content/tools
      if (
        delta.role === "assistant" &&
        !delta.content &&
        !delta.tool_calls &&
        !("function_call" in delta)
      ) {
        return null;
      }

      const choiceprobs = choice.logprobs;
      if (!choiceprobs || typeof choiceprobs !== "object") return null;

      const contentProbs = Array.isArray(choiceprobs.content)
        ? choiceprobs.content[0]
        : null;
      if (!contentProbs || typeof contentProbs !== "object") return null;

      const token =
        typeof contentProbs.token === "string" ? contentProbs.token : "";
      const tokenId = parseTokenId(token);
      if (tokenId === null || tokenId === -1) return null;

      // Get text from bytes if available
      let text = "";
      const bytes = Array.isArray(contentProbs.bytes) ? contentProbs.bytes : [];
      if (bytes.length) {
        text = String.fromCharCode(...bytes);
      } else {
        // If no bytes, use content or tool call argument piece
        if (delta.content !== null) {
          text = typeof delta.content === "string" ? delta.content : "";
        } else if (
          Array.isArray(delta.tool_calls) &&
          delta.tool_calls.length > 0
        ) {
          const toolCall = delta.tool_calls[0];
          if (
            toolCall &&
            typeof toolCall === "object" &&
            "function" in toolCall
          ) {
            text =
              typeof toolCall.function.arguments === "string"
                ? toolCall.function.arguments
                : "";
          }
        }
      }

      return {
        text,
        token_id: tokenId,
        logprob:
          typeof contentProbs.logprob === "number"
            ? contentProbs.logprob
            : -100,
        is_usage: false,
      };
    } else if (requestType === RequestEndpoint.COMPLETION) {
      if (!("text" in choice)) return null;
      const text = choice.text;
      if (typeof text !== "string") return null;

      const logprobs = choice.logprobs;
      if (!logprobs || typeof logprobs !== "object") return null;

      // For text completions, we'll use the text as is and set default values
      // since we don't have token IDs in this format
      return {
        text,
        token_id: 0,
        logprob: 0,
        is_usage: false,
      };
    }

    return null;
  } catch {
    return null;
  }
}

function parseTokenId(token: string): number | null {
  if (!token) return -1;

  if (token.startsWith("token_id:")) {
    try {
      const id = token.split(":")[1];
      return id ? parseInt(id) : null;
    } catch {
      return null;
    }
  }

  try {
    return parseInt(token);
  } catch {
    return null;
  }
}

function extractUsageData(
  chunks: unknown[],
):
  | { completion_tokens: number; prompt_tokens: number; total_tokens: number }
  | undefined {
  const usageChunk = chunks.find(
    (chunk) =>
      chunk &&
      typeof chunk === "object" &&
      "usage" in chunk &&
      chunk.usage &&
      typeof chunk.usage === "object" &&
      "completion_tokens" in chunk.usage &&
      "prompt_tokens" in chunk.usage &&
      "total_tokens" in chunk.usage,
  ) as UsageChunk | undefined;

  return usageChunk?.usage;
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

    const innerSyntheticResponses = db
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

    const innerOrganicResponses = db
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
        db.select().from(inner).orderBy(desc(inner.block)),
        db
          .select()
          .from(innerSyntheticResponses)
          .orderBy(desc(innerSyntheticResponses.id))
          .limit(100)
          .then((responses) => {
            return responses.map((response) => {
              const parsedTokens = Array.isArray(response.tokens)
                ? response.tokens
                    .map((chunk: unknown) => {
                      const endpoint =
                        response.request_endpoint === "CHAT"
                          ? RequestEndpoint.CHAT
                          : RequestEndpoint.COMPLETION;
                      const parsed = parseStreamingChunk(
                        chunk as StreamingChunk | CompletionChunk | UsageChunk,
                        endpoint,
                      );
                      return parsed;
                    })
                    .filter((token): token is Token => token !== null)
                : [];
              const usage = Array.isArray(response.tokens)
                ? extractUsageData(response.tokens)
                : undefined;

              return {
                ...response,
                parsedTokens,
                usage,
              };
            });
          }) as Promise<Response[]>,
        db
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
