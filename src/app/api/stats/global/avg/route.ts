import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/schema/db";
import { ApiKey, MinerResponse, User, ValidatorRequest } from "@/schema/schema";

// Schema to validate the input
const schema = z.object({
  verified: z.boolean(),
  startblock: z.number().optional(), // User can pass a start block
  endblock: z.number().optional(), // User can pass an end block
  limit: z.number().optional(), // For pagination
  offset: z.number().optional(), // For pagination
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
  const startBlockInput = req.nextUrl.searchParams.get("startblock")
    ? parseInt(req.nextUrl.searchParams.get("startblock")!)
    : undefined;
  const endBlockInput = req.nextUrl.searchParams.get("endblock")
    ? parseInt(req.nextUrl.searchParams.get("endblock")!)
    : undefined;
  const limitInput = req.nextUrl.searchParams.get("limit")
    ? parseInt(req.nextUrl.searchParams.get("limit")!)
    : 100; // Default to 100 if not provided
  const offsetInput = req.nextUrl.searchParams.get("offset")
    ? parseInt(req.nextUrl.searchParams.get("offset")!)
    : 0; // Default to 0 if not provided

  const response = schema.safeParse({
    verified,
    startblock: startBlockInput,
    endblock: endBlockInput,
    limit: limitInput,
    offset: offsetInput,
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
        id: MinerResponse.id,
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
      .groupBy(ValidatorRequest.block, MinerResponse.id)
      .orderBy(desc(ValidatorRequest.block))
      .limit(limitInput) // Pagination limit
      .offset(offsetInput), // Pagination offset
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

  // Calculate total records for pagination
  const totalRecords = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(MinerResponse)
    .innerJoin(
      ValidatorRequest,
      eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
    )
    .where(
      and(
        gte(ValidatorRequest.block, startBlock),
        lte(ValidatorRequest.block, endBlock),
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
    .then((result) => result[0]?.count ?? 0);

  // Return the results to the client with pagination metadata
  return NextResponse.json({
    data: stats,
    pagination: {
      limit: limitInput,
      offset: offsetInput,
      totalRecords: totalRecords,
      hasMore: offsetInput + limitInput < totalRecords, // Determine if there are more records to fetch
    },
  });
};
