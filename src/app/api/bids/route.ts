import { NextResponse } from "next/server";

import { getAllBids } from "@/server/api/routers/miners";

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
