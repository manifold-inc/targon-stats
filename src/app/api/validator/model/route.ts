import { NextResponse, type NextRequest } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/schema/db";
import { ApiKey, User, Validator } from "@/schema/schema";

// Define the input schema
const schema = z.object({
  validator_hotkeys: z.string().array().optional(),
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
    const validatorModels = await db
      .select({
        hotkey: Validator.hotkey,
        valiName: Validator.valiName,
        models: Validator.models,
      })
      .from(Validator)
      .where(
        and(
          ...(body.validator_hotkeys
            ? [inArray(Validator.hotkey, body.validator_hotkeys)]
            : []),
        ),
      );

    return NextResponse.json({
      validatorModels,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to retrieve validator models",
          details: error.message,
        },
        { status: 500 },
      );
    }
  }
};
