import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
          hotkey?: string;
          coldkey?: string;
        };
      }
    | string
    | number
    | string[]
    | { h100: number; h200: number };
}

// Define the input schema with limit and offset
const schema = z.object({
  query: z.string(),
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

    const query = body.data.query;

    const mongoDb = getMongoDb();
    if (!mongoDb) {
      throw new Error("Failed to connect to MongoDB");
    }

    // First try to find by UID if query is short enough
    let targetUid: number | undefined;
    if (query.length < 5) {
      targetUid = parseInt(query);
    } else {
      // For hotkey/coldkey, we need to find the UID first
      const targonCollection = (await mongoDb
        .collection("uid_responses")
        .find({})
        .toArray()) as unknown as TargonDoc[];

      const minerDoc = targonCollection.find((doc) => {
        // Check if any of the API endpoints have this hotkey/coldkey
        return Object.entries(doc).some(([key, value]) => {
          if (
            key !== "gpus" &&
            key !== "_id" &&
            key !== "uid" &&
            key !== "last_updated" &&
            key !== "models" &&
            typeof value === "object" &&
            value !== null &&
            "miner_cache" in value
          ) {
            const cache = value.miner_cache as {
              hotkey?: string;
              coldkey?: string;
            };
            return cache.hotkey === query || cache.coldkey === query;
          }
          return false;
        });
      });

      if (minerDoc) {
        targetUid = minerDoc.uid;
      }
    }

    if (!targetUid) {
      return NextResponse.json(
        { error: "No GPU data found for the given query" },
        { status: 404 },
      );
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

    const gpuStats = {
      avg: { h100: 0, h200: 0 },
      validators: [] as Array<{
        name: string;
        gpus: { h100: number; h200: number };
        models: string[];
      }>,
    };

    // Add base GPU stats from the document
    if (minerDoc.gpus) {
      gpuStats.validators.push({
        name: "base",
        gpus: {
          h100: minerDoc.gpus.h100 || 0,
          h200: minerDoc.gpus.h200 || 0,
        },
        models: minerDoc.models || [],
      });
    }

    // Add GPU stats from all API endpoints
    Object.entries(minerDoc).forEach(([key, value]) => {
      if (
        key !== "gpus" && // Skip the base gpus field
        key !== "_id" && // Skip MongoDB _id
        key !== "uid" && // Skip uid
        key !== "last_updated" && // Skip last_updated
        key !== "models" && // Skip models
        typeof value === "object" &&
        value !== null &&
        "miner_cache" in value &&
        value.miner_cache?.gpus
      ) {
        const gpus = value.miner_cache.gpus;
        gpuStats.validators.push({
          name: key,
          gpus: {
            h100: gpus.h100 || 0,
            h200: gpus.h200 || 0,
          },
          models: value.miner_cache.models || [],
        });
      }
    });

    // Calculate averages
    if (gpuStats.validators.length > 0) {
      gpuStats.avg = {
        h100: Math.round(
          gpuStats.validators.reduce(
            (acc, validator) => acc + validator.gpus.h100,
            0,
          ) / gpuStats.validators.length,
        ),
        h200: Math.round(
          gpuStats.validators.reduce(
            (acc, validator) => acc + validator.gpus.h200,
            0,
          ) / gpuStats.validators.length,
        ),
      };
    }

    return NextResponse.json(gpuStats);
  } catch (error) {
    console.error("Error fetching GPU stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch GPU stats" },
      { status: 500 },
    );
  }
}
