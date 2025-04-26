import { NextResponse } from "next/server";
import { z } from "zod";

import { type TargonDoc } from "@/app/page";
import { getMongoDb } from "@/schema/mongoDB";

// Define the input schema with limit and offset
const schema = z.object({
  uid: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json(
        { error: "Invalid request", errors: body.error },
        { status: 400 },
      );
    }

    const query = body.data.uid;
    const targetUid = query;

    if (!targetUid) {
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

    const minerDoc = targonCollection[0] as TargonDoc | undefined;
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
