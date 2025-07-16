import { NextResponse } from "next/server";

import { connectToMongoDb } from "@/schema/mongoDB";

export async function getMaxBid(): Promise<number> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find({})
    .sort({ block: -1 })
    .limit(1)
    .toArray();
  if (!data[0]) throw new Error("Failed to get most recent block");
  if (!data[0].max_bid) throw new Error("Failed to get max bid");

  return data[0].max_bid as number;
}

export async function GET() {
  try {
    const maxBid = await getMaxBid();
    return NextResponse.json({
      success: true,
      data: maxBid,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: "INTERNAL_ERROR",
          statusCode: 500,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
