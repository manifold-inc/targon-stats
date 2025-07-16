import { NextResponse } from "next/server";

import { type Miner } from "@/app/api/miners/route";
import { connectToMongoDb } from "@/schema/mongoDB";
import { type Auction } from "@/server/api/routers/chain";
import { getNodesByMiner } from "@/utils/utils";

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

async function getMiner(uid: string): Promise<Miner | null> {
  const auction_results = await getAllMiners();
  if (!auction_results) throw new Error("Failed to get miners");
  return auction_results.find((miner) => miner.uid === uid) || null;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Miner ID is required",
            code: "MISSING_ID",
            statusCode: 400,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const miner = await getMiner(id);
    if (!miner) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Miner not found",
            code: "MINER_NOT_FOUND",
            statusCode: 404,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: miner,
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
