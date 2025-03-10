import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { type TargonDoc } from "@/app/stats/miner/[query]/MinerData";
import { getMongoDb } from "@/schema/mongoDB";
import { statsDB } from "@/schema/psDB";
import { ApiKey, User } from "@/schema/schema";

// Define the input schema with limit and offset
const schema = z.object({
  uid: z.string(),
});

export async function POST(request: Request) {
  try {
    // Bearer Token Authentications
    const bearerToken = request.headers.get("Authorization")?.split(" ").at(1);
    if (!bearerToken) {
      return NextResponse.json(
        { error: "Missing Bearer Token" },
        { status: 401 },
      );
    }

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

    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json(
        { error: "Invalid request", errors: body.error },
        { status: 400 },
      );
    }

    const query = body.data.uid;
    const targetUid = parseInt(query);

    if (isNaN(targetUid)) {
      return NextResponse.json(
        { error: "Query must be a valid UID" },
        { status: 400 },
      );
    }

    const mongoDb = getMongoDb();
    if (!mongoDb) {
      throw new Error("Failed to connect to MongoDB");
    }

    const targonCollection = (await mongoDb
      .collection("uid_responses")
      .find({ uid: targetUid })
      .toArray()) as unknown as TargonDoc[];

    const minerDoc = targonCollection[0];
    if (!minerDoc) {
      return NextResponse.json(
        { error: "No GPU data found for the given UID" },
        { status: 404 },
      );
    }

    return NextResponse.json(minerDoc);
  } catch (error) {
    console.error("Error fetching GPU stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch GPU stats" },
      { status: 500 },
    );
  }
}
