import { NextResponse } from "next/server";

import { getAuctionState } from "@/server/api/routers/chain";
import { getNodes } from "@/utils/utils";

export type MinerNode = {
  uid: string;
  price: number;
  payout: number;
  gpus: number;
  diluted: boolean;
  hotkey?: string;
};

export async function GET() {
  try {
    const auction = await getAuctionState();
    if (!auction) throw new Error("Failed to get most recent auction");
    const bids = getNodes(auction.auction_results);
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
