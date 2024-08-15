import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/schema/db";
import {
  ApiKey,
  MinerResponse,
  User,
  Validator,
  ValidatorRequest,
} from "@/schema/schema";

// Define the schema for input validation
const schema = z.object({
  query: z.string(),
  startblock: z.number().optional(),
  endblock: z.number().optional(),
  vhotkey: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const POST = async (req: NextRequest) => {
  // Bearer Token Authentication
  const bearerToken = req.headers.get("Authorization")?.split(" ").at(1);
  if (!bearerToken) {
    return NextResponse.json(
      { error: "Missing Bearer Token" },
      { status: 401 },
    );
  }

  // Parse and validate the JSON body
  const response = schema.safeParse(await req.json());
  if (!response.success) {
    return NextResponse.json(
      {
        error: { message: "Invalid request", errors: response.error },
      },
      { status: 400 },
    );
  }

  const { query, startblock, endblock, vhotkey, limit, offset } = response.data;

  const limitValue = limit ?? 100;
  const offsetValue = offset ?? 0;

  // Determine the latest block
  const latestBlock = await db
    .select({ maxBlock: sql<number>`MAX(${ValidatorRequest.block})` })
    .from(ValidatorRequest)
    .then((result) => result[0]?.maxBlock ?? 0);

  // Calculate the start and end block based on user input or defaults
  const startBlock = startblock ?? latestBlock - 360;
  const endBlock = endblock ?? latestBlock;

  // Determine if the minerIdentifier is a hotkey, coldkey, or uid
  const minerIdentifier =
    query.length < 5
      ? [eq(MinerResponse.uid, parseInt(query))]
      : [eq(MinerResponse.hotkey, query), eq(MinerResponse.coldkey, query)];

  const totalRecords = await db
    .select({ totalRecords: sql<number>`COUNT(*)` })
    .from(MinerResponse)
    .innerJoin(
      ValidatorRequest,
      eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
    )
    .innerJoin(Validator, eq(Validator.hotkey, ValidatorRequest.hotkey))
    .where(
      and(
        gte(ValidatorRequest.block, startBlock),
        lte(ValidatorRequest.block, endBlock),
        or(...minerIdentifier),
        ...(vhotkey ? [eq(Validator.hotkey, vhotkey)] : []),
      ),
    );

  // Fetch user details (authenticate the token) and responses for the specified miner
  const [[user], responses] = await Promise.all([
    db
      .select({
        id: User.id,
      })
      .from(User)
      .innerJoin(ApiKey, eq(ApiKey.userId, User.id))
      .where(eq(ApiKey.key, bearerToken))
      .limit(1),
    db
      .select({
        response: sql<string>`${MinerResponse.stats}->'response'`,
        ground_truth: sql<string>`${ValidatorRequest.ground_truth}->'ground_truth'`,
        prompt: sql<string>`${ValidatorRequest.ground_truth}->'messages'`,
        hotkey: MinerResponse.hotkey,
        coldkey: MinerResponse.coldkey,
        uid: MinerResponse.uid,
        block: ValidatorRequest.block,
        timestamp: ValidatorRequest.timestamp,
        tokens: sql<string[]>`${MinerResponse.stats}->'tokens'`,
        seed: sql<string>`${ValidatorRequest.sampling_params}->'seed'`,
        top_k: sql<string>`${ValidatorRequest.sampling_params}->'top_k'`,
        top_p: sql<string>`${ValidatorRequest.sampling_params}->'top_p'`,
        best_of: sql<string>`${ValidatorRequest.sampling_params}->'best_of'`,
        typical_p: sql<string>`${ValidatorRequest.sampling_params}->'typical_p'`,
        temperature: sql<string>`${ValidatorRequest.sampling_params}->'temperature'`,
        top_n_tokens: sql<string>`${ValidatorRequest.sampling_params}->'top_n_tokens'`,
        max_n_tokens: sql<string>`${ValidatorRequest.sampling_params}->'max_new_tokens'`,
        repetition_penalty: sql<string>`${ValidatorRequest.sampling_params}->'repetition_penalty'`,
        stream: sql<boolean>`CAST(${ValidatorRequest.sampling_params}->'stream' AS BOOLEAN)`,
        details: sql<boolean>`CAST(${ValidatorRequest.sampling_params}->'details' AS BOOLEAN)`,
        do_sample: sql<boolean>`CAST(${ValidatorRequest.sampling_params}->'do_sample' AS BOOLEAN)`,
        watermark: sql<boolean>`CAST(${ValidatorRequest.sampling_params}->'watermark' AS BOOLEAN)`,
        return_full_text: sql<boolean>`CAST(${ValidatorRequest.sampling_params}->'return_full_text' AS BOOLEAN)`,
        decoder_input_details: sql<boolean>`CAST(${ValidatorRequest.sampling_params}->'decoder_input_details' AS BOOLEAN)`,
        version: ValidatorRequest.version,
        validator: Validator.valiName,
        vhotkey: Validator.hotkey,
        jaro_score:
          sql<number>`CAST(${MinerResponse.stats}->'jaro_score' AS DECIMAL)`.mapWith(
            Number,
          ),
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
        id: MinerResponse.id, // Use id for pagination
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
          lte(ValidatorRequest.block, endBlock),
          or(...minerIdentifier),
          ...(vhotkey ? [eq(Validator.hotkey, vhotkey)] : []),
        ),
      )
      .orderBy(desc(ValidatorRequest.block), desc(MinerResponse.id))
      .limit(limitValue)
      .offset(offsetValue),
  ]);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid Bearer Token" },
      { status: 401 },
    );
  }

  if (responses.length === 0) {
    return NextResponse.json(
      { error: `No responses found for miner ${query}` },
      { status: 404 },
    );
  }

  // Return the results to the client with pagination metadata
  return NextResponse.json({
    responses: responses,
    totalRecords: totalRecords[0]!.totalRecords,
    offset: offsetValue,
    limit: limitValue,
  });
};
