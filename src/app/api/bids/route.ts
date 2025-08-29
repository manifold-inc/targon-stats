import { NextResponse } from "next/server";

import { getAuctionState } from "@/server/api/routers/chain";
import { getNodes } from "@/utils/utils";

export type MinerNode = {
  uid: string;
  price: number;
  payout: number;
  count: number;
  diluted: boolean;
};

export async function GET() {
  try {
    const auction = await getAuctionState();
    if (!auction) throw new Error("Failed to get most recent auction");
    const bids = getNodes(auction.auction_results);
    return NextResponse.json({
      data: bids,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        error: {
          message,
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    );
  }
}
