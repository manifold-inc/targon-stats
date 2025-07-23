import { NextResponse } from "next/server";

import { getAuctionState } from "@/server/api/routers/chain";

export async function GET() {
  try {
    const auction = await getAuctionState();
    if (!auction) throw new Error("Failed to get most recent auction");
    const bid = auction.max_bid;
    if (!bid) throw new Error("Failed to get max bid");

    return NextResponse.json({
      data: bid,
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
