import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/schema/db";
import { ApiKey, MinerResponse, User, ValidatorRequest } from "@/schema/schema";

// Define the input schema with limit and offset
const schema = z.object({
  verified: z.boolean(),
  startblock: z.number().optional(),
  endblock: z.number().optional(),
});

export const POST = async (req: NextRequest) => {
  const bearerToken = req.headers.get("Authorization")?.split(" ").at(1);
  if (!bearerToken) {
    return NextResponse.json(
      { error: "Missing Bearer Token" },
      { status: 401 },
    );
  }

  // Validate the incoming request
  const response = schema.safeParse(await req.json());
  if (!response.success) {
    return NextResponse.json(
      {
        error: { message: "Invalid request", errors: response.error },
      },
      { status: 400 },
    );
  }

  const body = response.data;

  // Fetch the latest block to set default values for start_block and end_block
  const latestBlock = await db
    .select({ latest: sql<number>`MAX(${ValidatorRequest.block})` })
    .from(ValidatorRequest)
    .limit(1)
    .then((res) => res[0]?.latest || 0);

  const startBlock = body.startblock ?? latestBlock - 360;
  const endBlock = body.endblock ?? latestBlock;

  // Check for version consistency across the block range
  const versionRangeResult = await db
    .select({
      min_version: sql<number>`MIN(${ValidatorRequest.version})`,
      max_version: sql<number>`MAX(${ValidatorRequest.version})`,
    })
    .from(ValidatorRequest)
    .where(
      and(
        gte(ValidatorRequest.block, startBlock),
        lte(ValidatorRequest.block, endBlock),
      ),
    )
    .limit(1);

  const { min_version, max_version } = versionRangeResult[0] ?? {};

  if (min_version !== max_version) {
    // Find the nearest block where the version changes
    const nearestBlockResult = await db
      .select({
        block: ValidatorRequest.block,
      })
      .from(ValidatorRequest)
      .where(
        and(
          gte(ValidatorRequest.block, startBlock),
          lte(ValidatorRequest.block, endBlock),
          eq(ValidatorRequest.version, min_version!),
        ),
      )
      .orderBy(desc(ValidatorRequest.block))
      .limit(1);

    const nearestBlock = nearestBlockResult[0]?.block ?? "unknown";

    return NextResponse.json(
      {
        error: `Block range contains multiple versions (min: ${min_version}, max: ${max_version}). The nearest consistent block range ends at block ${nearestBlock}.`,
      },
      { status: 400 },
    );
  }

  const version = min_version;
  console.log("Version: ", version);
  const versionCutoff = 204070;

  const user = await db
    .select({
      id: User.id,
    })
    .from(User)
    .innerJoin(ApiKey, eq(ApiKey.userId, User.id))
    .where(eq(ApiKey.key, bearerToken))
    .limit(1);

  if (!user || user.length === 0) {
    return NextResponse.json(
      { error: "Invalid Bearer Token" },
      { status: 401 },
    );
  }

  try {
    let stats;
    switch (true) {
      case version! >= versionCutoff:
        // Handle the query for versions >= 204070 (where `jaro` is an array)
        stats = await db
          .select({
            minute:
              sql<string>`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`.mapWith(
                (v: string) => {
                  const date = new Date(v);
                  const utc = Date.UTC(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    date.getHours(),
                    date.getMinutes(),
                  );
                  return utc;
                },
              ),
            avg_jaro: sql<number>`
              AVG((SELECT AVG(value::float) FROM jsonb_array_elements(${MinerResponse.stats}->'jaros')))`.mapWith(
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
              lte(ValidatorRequest.block, endBlock),
              ...(body.verified
                ? [
                    eq(
                      sql`CAST(${MinerResponse.stats}->'verified' AS BOOLEAN)`,
                      body.verified,
                    ),
                  ]
                : []),
            ),
          )
          .groupBy(sql`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`)
          .orderBy(
            desc(sql`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`),
          );
        break;

      case version! < versionCutoff:
        // Handle the query for versions < 204070 (where `jaro` is a string)
        stats = await db
          .select({
            minute:
              sql<string>`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`.mapWith(
                (v: string) => {
                  const date = new Date(v);
                  const utc = Date.UTC(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    date.getHours(),
                    date.getMinutes(),
                  );
                  return utc;
                },
              ),
            avg_jaro: sql<number>`
              AVG(CAST(${MinerResponse.stats}->'jaro_score' AS FLOAT))`.mapWith(
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
              lte(ValidatorRequest.block, endBlock),
              ...(body.verified
                ? [
                    eq(
                      sql`CAST(${MinerResponse.stats}->'verified' AS BOOLEAN)`,
                      body.verified,
                    ),
                  ]
                : []),
            ),
          )
          .groupBy(sql`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`)
          .orderBy(
            desc(sql`DATE_TRUNC('MINUTES', ${ValidatorRequest.timestamp})`),
          );

        break;
    }

    return NextResponse.json({
      stats,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to retrieve stats", details: error.message },
        { status: 500 },
      );
    }
  }
};
