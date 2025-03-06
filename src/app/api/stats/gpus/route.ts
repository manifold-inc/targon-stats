import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { getMongoDb } from "@/schema/mongoDB";
import { statsDB } from "@/schema/psDB";
import { ApiKey, User } from "@/schema/schema";

interface TargonDoc {
  _id: string;
  uid: number;
  last_updated: number;
  models: string[];
  gpus: {
    h100: number;
    h200: number;
  };
  [key: string]:
    | {
        miner_cache: {
          weight: number;
          nodes_endpoint_error: string | null;
          models: string[];
          gpus: {
            h100: number;
            h200: number;
          } | null;
        };
      }
    | string
    | number
    | string[]
    | { h100: number; h200: number };
}

export const POST = async (req: NextRequest) => {
  // Bearer Token Authentication
  const bearerToken = req.headers.get("Authorization")?.split(" ").at(1);
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

  try {
    const mongoDb = getMongoDb();
    const targonCollection = (await mongoDb
      .collection("uid_responses")
      .find({})
      .toArray()) as unknown as TargonDoc[];

    let totalGPUs = { h100: 0, h200: 0 };

    totalGPUs = targonCollection.reduce(
      (acc: { h100: number; h200: number }, validator: TargonDoc) => {
        if (
          "targon-hub-api" in validator &&
          typeof validator["targon-hub-api"] === "object" &&
          "miner_cache" in validator["targon-hub-api"] &&
          validator["targon-hub-api"].miner_cache?.gpus
        ) {
          const gpus = validator["targon-hub-api"].miner_cache.gpus;
          return {
            h100: (acc.h100 || 0) + (gpus.h100 || 0),
            h200: (acc.h200 || 0) + (gpus.h200 || 0),
          };
        }
        return acc;
      },
      { h100: 0, h200: 0 },
    );

    return NextResponse.json(totalGPUs);
  } catch (error) {
    console.error("Error calculating GPU stats:", error);
    return NextResponse.json(
      { error: "Failed to calculate GPU stats" },
      { status: 500 },
    );
  }
};
