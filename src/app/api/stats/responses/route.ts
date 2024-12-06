import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
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
  verified: z.boolean(),
  startblock: z.number().optional(),
  endblock: z.number().optional(),
  validator_hotkeys: z.string().array().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  extras: z
    .object({
      tokens: z.boolean().optional().default(false),
    })
    .optional()
    .default({ tokens: false }),
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
  } else {
    if (response.data.limit && response.data.limit > 300) {
      return NextResponse.json(
        {
          error: { message: "Max Limit is 300" },
        },
        { status: 400 },
      );
    }
  }

  const {
    query,
    verified,
    startblock,
    endblock,
    validator_hotkeys,
    limit,
    offset,
    extras,
  } = response.data;

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
        ...(validator_hotkeys
          ? [inArray(Validator.hotkey, validator_hotkeys)]
          : []),
      ),
    );

  // Determine if there are more records
  const hasMoreRecords =
    offsetValue + limitValue < totalRecords[0]!.totalRecords;

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
        tps: MinerResponse.tps,
        totalTime: MinerResponse.totalTime,
        timeToFirstToken: MinerResponse.timeToFirstToken,
        timeForAllTokens: MinerResponse.timeForAllTokens,
        verified: MinerResponse.verified,
        ...(extras.tokens && { tokens: MinerResponse.tokens }),
        error: MinerResponse.error,
        cause: MinerResponse.cause,
        organic: MinerResponse.organic,
        messages: ValidatorRequest.messages,
        model: ValidatorRequest.model,
        seed: ValidatorRequest.seed,
        max_tokens: ValidatorRequest.max_tokens,
        temperature: ValidatorRequest.temperature,
        request_endpoint: ValidatorRequest.request_endpoint,
        block: ValidatorRequest.block,
        timestamp: MinerResponse.timestamp,
        version: ValidatorRequest.version,
        validator: Validator.valiName,
        validator_hotkey: Validator.hotkey,
        id: MinerResponse.id,
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
          eq(MinerResponse.verified, verified),
          or(...minerIdentifier),
          ...(validator_hotkeys
            ? [inArray(Validator.hotkey, validator_hotkeys)]
            : []),
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
    hasMoreRecords: hasMoreRecords,
  });
};
