import { NextResponse, type NextRequest } from "next/server";
import { and, avg, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/schema/db";
import {
  ApiKey,
  MinerResponse,
  User,
  Validator,
  ValidatorRequest,
} from "@/schema/schema";

// Define the input schema with limit and offset
const schema = z.object({
  verified: z.boolean(),
  startblock: z.number().optional(),
  endblock: z.number().optional(),
  validator_hotkeys: z.string().array().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
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

  const body = response.data;

  const limit = body.limit ?? 100;
  const offset = body.offset ?? 0;

  // Fetch the latest block to set default values for start_block and end_block
  const latestBlock = await db
    .select({ latest: sql<number>`MAX(${ValidatorRequest.block})` })
    .from(ValidatorRequest)
    .limit(1)
    .then((res) => res[0]?.latest || 0);

  const startBlock = body.startblock ?? latestBlock - 360;
  const endBlock = body.endblock ?? latestBlock;

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
        ...(body.verified ? [eq(MinerResponse.verified, body.verified)] : []),
        ...(body.validator_hotkeys
          ? [inArray(Validator.hotkey, body.validator_hotkeys)]
          : []),
      ),
    );

  // Determine if there are more records
  const hasMoreRecords = limit + offset < totalRecords[0]!.totalRecords;

  try {
    const stats = await db
      .select({
        minute:
          sql<string>`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`.mapWith(
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
        avg_tps: avg(MinerResponse.tps),
        avg_time_for_all_tokens: avg(MinerResponse.timeForAllTokens),
        avg_total_time: avg(MinerResponse.totalTime),
        avg_time_to_first_token: avg(MinerResponse.timeToFirstToken),
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
          ...(body.verified ? [eq(MinerResponse.verified, body.verified)] : []),
          ...(body.validator_hotkeys
            ? [inArray(Validator.hotkey, body.validator_hotkeys)]
            : []),
        ),
      )
      .groupBy(
        sql`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`,
        Validator.hotkey,
        MinerResponse.id,
      )
      .orderBy(
        sql`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`,
        desc(MinerResponse.id),
      )
      .limit(limit)
      .offset(offset);
    return NextResponse.json({
      stats,
      totalRecords: totalRecords[0]!.totalRecords,
      offset,
      limit,
      hasMoreRecords,
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
