import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { statsDB } from "@/schema/psDB";
import {
  ApiKey,
  MinerResponse,
  OrganicRequest,
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
      organics: z.boolean().optional().default(false),
    })
    .optional()
    .default({ tokens: false, organics: false }),
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
  const latestBlock = await statsDB
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

  // Get user first for authentication
  const [user] = await statsDB
    .select({
      id: User.id,
    })
    .from(User)
    .innerJoin(ApiKey, eq(ApiKey.userId, User.id))
    .where(eq(ApiKey.key, bearerToken))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid Bearer Token" },
      { status: 401 },
    );
  }

  if (extras.organics) {
    const [recordCount, rawResponses] = await Promise.all([
      statsDB
        .select({ totalRecords: sql<number>`COUNT(*)` })
        .from(OrganicRequest)
        .where(
          and(
            query.length < 5
              ? eq(OrganicRequest.uid, parseInt(query))
              : or(
                  eq(OrganicRequest.hotkey, query),
                  eq(OrganicRequest.coldkey, query),
                ),
          ),
        ),
      statsDB
        .select({
          req_id: OrganicRequest.th_pub_id,
          tps: OrganicRequest.tps,
          totalTime: OrganicRequest.total_time,
          timeToFirstToken: OrganicRequest.time_to_first_token,
          timeForAllTokens: OrganicRequest.time_for_all_tokens,
          verified: OrganicRequest.verified,
          error: OrganicRequest.error,
          cause: OrganicRequest.cause,
          model: OrganicRequest.model,
          seed: OrganicRequest.seed,
          maxTokens: OrganicRequest.max_tokens,
          temperature: OrganicRequest.temperature,
          requestEndpoint: OrganicRequest.request_endpoint,
          timestamp: OrganicRequest.created_at,
          id: OrganicRequest.id,
        })
        .from(OrganicRequest)
        .where(
          and(
            query.length < 5
              ? eq(OrganicRequest.uid, parseInt(query))
              : or(
                  eq(OrganicRequest.hotkey, query),
                  eq(OrganicRequest.coldkey, query),
                ),
          ),
        )
        .orderBy(desc(OrganicRequest.created_at))
        .limit(limitValue)
        .offset(offsetValue),
    ]);

    return NextResponse.json({
      responses: rawResponses.map((response) => ({
        ...response,
        tokens: [],
        messages: [],
        block: 0,
        version: 0,
        validator: "",
        validatorHotkey: "",
      })),
      totalRecords: recordCount[0]!.totalRecords,
      offset: offsetValue,
      limit: limitValue,
      hasMoreRecords: offsetValue + limitValue < recordCount[0]!.totalRecords,
    });
  }

  if (!extras.organics) {
    const [recordCount, responses] = await Promise.all([
      statsDB
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
        ),
      statsDB
        .select({
          tps: MinerResponse.tps,
          totalTime: MinerResponse.totalTime,
          timeToFirstToken: MinerResponse.timeToFirstToken,
          timeForAllTokens: MinerResponse.timeForAllTokens,
          verified: MinerResponse.verified,
          ...(extras.tokens && { tokens: MinerResponse.tokens }),
          error: MinerResponse.error,
          cause: MinerResponse.cause,
          messages: ValidatorRequest.messages,
          model: ValidatorRequest.model,
          seed: ValidatorRequest.seed,
          maxTokens: ValidatorRequest.max_tokens,
          temperature: ValidatorRequest.temperature,
          requestEndpoint: ValidatorRequest.request_endpoint,
          block: ValidatorRequest.block,
          timestamp: MinerResponse.timestamp,
          version: ValidatorRequest.version,
          validator: Validator.valiName,
          validatorHotkey: Validator.hotkey,
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

    return NextResponse.json({
      responses,
      totalRecords: recordCount[0]!.totalRecords,
      offset: offsetValue,
      limit: limitValue,
      hasMoreRecords: offsetValue + limitValue < recordCount[0]!.totalRecords,
    });
  }
};
