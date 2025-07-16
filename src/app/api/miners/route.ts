import { NextResponse } from "next/server";

import { connectToMongoDb } from "@/schema/mongoDB";
import { type Auction } from "@/server/api/routers/chain";
import { getNodesByMiner } from "@/utils/utils";

export type Miner = {
  uid: string;
  average_price: number;
  average_payout: number;
  total_price: number;
  total_payout: number;
  gpus: number;
  nodes: number;
  diluted: boolean;
};

async function getAllMiners(): Promise<Miner[]> {
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
  return getNodesByMiner(auction_results);
}

export async function GET() {
  try {
    const miners = await getAllMiners();
    return NextResponse.json({
      success: true,
      data: miners,
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
