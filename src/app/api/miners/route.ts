import { getAuctionState } from "@/server/api/routers/chain";
import { getNodes } from "@/utils/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auction = await getAuctionState();
    if (!auction) throw new Error("Failed to get most recent auction");
    const miners = getNodes(auction.auction_results);
    return NextResponse.json({
      data: miners,
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
      { status: 500 }
    );
  }
}
