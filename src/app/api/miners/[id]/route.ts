import { NextResponse } from "next/server";

import { getAllMiners, type Miner } from "@/app/api/miners/route";

export async function getMiner(uid: string): Promise<Miner | null> {
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
