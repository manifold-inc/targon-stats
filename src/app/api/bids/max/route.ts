import { NextResponse } from "next/server";

import { getAuctionState } from "@/server/api/routers/chain";

export async function GET() {
  try {
    const auction = await getAuctionState();
    if (!auction) throw new Error("Failed to get most recent auction");
    const bid = auction.max_bid;
    if (!bid) throw new Error("Failed to get max bid");

    return NextResponse.json({
      success: true,
      data: bid,
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
