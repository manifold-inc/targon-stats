import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/schema/db";
import { ApiKey, MinerResponse, User, ValidatorRequest } from "@/schema/schema";

// Schema to validate the input
const schema = z.object({
  query: z.string(),
  startblock: z.number().optional(), // User can pass a start block
  endblock: z.number().optional(), // User can pass an end block
});

export const GET = async (req: NextRequest) => {
  // Bearer Token Authentication
  const bearerToken = req.headers.get("Authorization")?.split(" ").at(1);
  if (!bearerToken) {
    return NextResponse.json(
      { error: "Missing Bearer Token" },
      { status: 401 },
    );
  }

  // Extract and validate the query parameters
  const query = req.nextUrl.searchParams.get("query") || "";
  const startBlockInput = req.nextUrl.searchParams.get("startblock")
    ? parseInt(req.nextUrl.searchParams.get("startblock")!)
    : undefined;
  const endBlockInput = req.nextUrl.searchParams.get("endblock")
    ? parseInt(req.nextUrl.searchParams.get("endblock")!)
    : undefined;

  const response = schema.safeParse({
    query,
    startblock: startBlockInput,
    endblock: endBlockInput,
  });
  if (!response.success) {
    return NextResponse.json(
      {
        error: { message: "Invalid request", errors: response.error },
      },
      { status: 400 },
    );
  }

  // Determine the latest block
  const latestBlock = await db
    .select({ maxBlock: sql<number>`MAX(${ValidatorRequest.block})` })
    .from(ValidatorRequest)
    .then((result) => result[0]?.maxBlock ?? 0);

  // Calculate the start and end block based on user input or defaults
  const startBlock = startBlockInput ?? latestBlock - 360;
  const endBlock = endBlockInput ?? latestBlock;

  // Determine if the minerIdentifier is a hotkey, coldkey, or uid
  const minerIdentifier =
    query.length < 5
      ? [eq(MinerResponse.uid, parseInt(query))]
      : [eq(MinerResponse.hotkey, query), eq(MinerResponse.coldkey, query)];

  // Fetch the user details and statistics
  const [[user], stats] = await Promise.all([
    db
      .select({
        credits: User.credits,
        id: User.id,
      })
      .from(User)
      .innerJoin(ApiKey, eq(ApiKey.userId, User.id))
      .where(eq(ApiKey.key, bearerToken))
      .limit(1),
    db
      .select({
        jaro_score:
          sql<number>`CAST(${MinerResponse.stats}->'jaro_score' AS DECIMAL)`.mapWith(
            Number,
          ),
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
      .where(
        and(
          gte(ValidatorRequest.block, startBlock),
          lte(ValidatorRequest.block, endBlock),
          or(...minerIdentifier),
        ),
      )
      .orderBy(desc(ValidatorRequest.block)),
  ]);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid Bearer Token" },
      { status: 401 },
    );
  }

  if (stats.length === 0) {
    return NextResponse.json(
      { error: "No statistics found for the given parameters" },
      { status: 404 },
    );
  }

  return NextResponse.json(stats);
};
