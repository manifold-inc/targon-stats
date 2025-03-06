import { NextResponse, type NextRequest } from "next/server";
import { and, eq, gt, gte, sql } from "drizzle-orm";

import { statsDB } from "@/schema/psDB";
import { ApiKey, User, Validator, ValidatorRequest } from "@/schema/schema";

export const POST = async (req: NextRequest) => {
  const bearerToken = req.headers.get("Authorization")?.split(" ").at(1);
  if (!bearerToken) {
    return NextResponse.json(
      { error: "Missing Bearer Token" },
      { status: 401 },
    );
  }

  const user = await statsDB
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
    const validatorLiveStats = await statsDB
      .select({
        hotkey: Validator.hotkey,
        valiName: Validator.valiName,
        models: Validator.models,
        requestCount: sql<string>`COUNT(${ValidatorRequest.r_nanoid})`.as(
          "requestCount",
        ),
      })
      .from(Validator)
      .leftJoin(
        ValidatorRequest,
        and(
          eq(Validator.hotkey, ValidatorRequest.hotkey),
          gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 1 DAY`),
        ),
      )
      .groupBy(Validator.hotkey)
      .having(gt(sql`COUNT(${ValidatorRequest.r_nanoid})`, 0));

    return NextResponse.json(validatorLiveStats);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to retrieve validator live stats",
          details: error.message,
        },
        { status: 500 },
      );
    }
  }
};
