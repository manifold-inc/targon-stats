import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/schema/db";
import { ApiKey, MinerResponse, User, ValidatorRequest } from "@/schema/schema";

// Schema to validate the input
const schema = z.object({
  verified: z.boolean(),
  block: z.number().optional(), // User can pass any number of blocks
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
  const verified = req.nextUrl.searchParams.get("verified") === "true";
  const block = req.nextUrl.searchParams.get("block")
    ? parseInt(req.nextUrl.searchParams.get("block")!)
    : undefined;

  const response = schema.safeParse({ verified, block });
  if (!response.success) {
    return NextResponse.json(
      {
        error: { message: "Invalid request", errors: response.error },
      },
      { status: 400 },
    );
  }

  // Determine the latest block and calculate the start block
  const latestBlock = await db
    .select({ maxBlock: sql<number>`MAX(${ValidatorRequest.block})` })
    .from(ValidatorRequest)
    .then((result) => result[0]?.maxBlock ?? 0);

  // If block is provided, calculate the start block, else start from the latest block
  const startBlock = block !== undefined ? latestBlock - block : latestBlock;

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
        block: ValidatorRequest.block,
        avg_jaro:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'jaro_score' AS DECIMAL))`.mapWith(
            Number,
          ),
        avg_wps:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'wps' AS DECIMAL))`.mapWith(
            Number,
          ),
        avg_time_for_all_tokens:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'time_for_all_tokens' AS DECIMAL))`.mapWith(
            Number,
          ),
        avg_total_time:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'total_time' AS DECIMAL))`.mapWith(
            Number,
          ),
        avg_time_to_first_token:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'time_to_first_token' AS DECIMAL))`.mapWith(
            Number,
          ),
      })
      .from(MinerResponse)
      .innerJoin(
        ValidatorRequest,
        eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
      )
      .where(
        and(
          gte(ValidatorRequest.block, startBlock),
          ...(response.data.verified
            ? [
                eq(
                  sql`CAST(${MinerResponse.stats}->'verified' AS BOOLEAN)`,
                  response.data.verified,
                ),
              ]
            : []),
        ),
      )
      .groupBy(ValidatorRequest.block)
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
