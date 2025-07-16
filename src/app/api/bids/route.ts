import { NextResponse } from "next/server";

import { connectToMongoDb } from "@/schema/mongoDB";
import { getNodes } from "@/utils/utils";

type Auction = Record<string, MinerNode[]>;

export type MinerNode = {
  uid: string;
  price: number;
  payout: number;
  gpus: number;
  diluted: boolean;
};

export async function getAllBids(): Promise<MinerNode[]> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find({})
    .sort({ block: -1 })
    .limit(1)
    .toArray();
  if (!data[0]) throw new Error("Failed to get most recent auction");

  const auction_results = data[0].auction_results as Auction;
  return getNodes(auction_results);
}

export async function GET() {
  try {
    const bids = await getAllBids();
    return NextResponse.json({
      success: true,
      data: bids,
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
