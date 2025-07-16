import { NextResponse } from "next/server";

import { getAuctionState } from "@/server/api/routers/chain";
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

export async function GET() {
  try {
    const auction = await getAuctionState();
    if (!auction) throw new Error("Failed to get most recent auction");
    const miners = getNodesByMiner(auction.auction_results);
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
