import { connectToMongoDb } from "@/schema/mongoDB";
import { createTRPCRouter, publicAuthlessProcedure } from "@/server/api/trpc";
import {
  type Auction,
  type AuctionResults,
  type AuctionState,
  type MinerNode,
} from "@/types";
import { removeIPAddress } from "@/utils/utils";
import { z } from "zod";

export async function getAuctionState(block?: number): Promise<AuctionState> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const [data] = await mongoDb
    .collection("miner_info")
    .find(block === undefined ? {} : { block })
    .sort({ block: -1 })
    .limit(1)
    .toArray();

  if (!data) {
    throw new Error("Failed to get auction for block " + (block ?? "latest"));
  }

  const auction_results = data.auction_results as AuctionResults;
  const parsedNodes: AuctionResults = {};

  for (const gpu in auction_results) {
    parsedNodes[gpu] = auction_results[gpu]!.map((node: MinerNode) =>
      removeIPAddress(node)
    );
  }

  const hotkeyToUid = data.hotkey_to_uid as Record<string, string>;
  const uidToHotkey: Record<string, string> = {};
  for (const [hotkey, uid] of Object.entries(hotkeyToUid)) {
    uidToHotkey[uid] = hotkey;
  }

  const state: AuctionState = {
    auction_results: parsedNodes,
    auctions: data.auctions as Record<string, Auction>,
    emission_pool: data.emission_pool as number,
    block: data.block as number,
    tao_price: data.tao_price as number,
    timestamp: data.timestamp as Date,
    weights: data.weights as { uids: number[]; incentives: number[] },
    hotkey_to_uid: uidToHotkey,
  };
  return state;
}

export type DailyAveragePayoutData = {
  date: string;
  dayIndex: number;
  averagePayoutPerCard: number;
  totalPayout: number;
  totalCards: number;
};

export async function getHistoricalPayoutData(
  days = 7,
  computeType?: string
): Promise<DailyAveragePayoutData[]> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const latestData = await mongoDb
    .collection("miner_info")
    .find({}, { projection: { block: 1 } })
    .sort({ block: -1 })
    .limit(1)
    .toArray();

  if (!latestData || latestData.length === 0) {
    return [];
  }

  const latestBlock = latestData[0]!.block as number;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const blocksPerDay = 360 * 24;
  const blocksToLookBack = days * blocksPerDay;
  const minBlock = Math.max(0, latestBlock - blocksToLookBack);

  const sampleSize = Math.min(200, days * 15);

  const data = await mongoDb
    .collection("miner_info")
    .find(
      {
        block: { $gte: minBlock, $lte: latestBlock },
      },
      {
        projection: {
          block: 1,
          auction_results: 1,
        },
      }
    )
    .sort({ block: -1 })
    .limit(sampleSize)
    .toArray();

  if (!data || data.length === 0) {
    return [];
  }

  const dailyData = new Map<
    string,
    {
      date: string;
      dayIndex: number;
      totalPayout: number;
      totalCards: number;
      recordCount: number;
    }
  >();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split("T")[0]!;

    dailyData.set(dateStr, {
      date: dateStr,
      dayIndex: i,
      totalPayout: 0,
      totalCards: 0,
      recordCount: 0,
    });
  }

  for (const record of data) {
    const recordBlock = record.block as number;
    const blockDiff = latestBlock - recordBlock;
    const estimatedDaysAgo = blockDiff / blocksPerDay;

    const recordDate = new Date(now);
    recordDate.setDate(recordDate.getDate() - Math.round(estimatedDaysAgo));
    recordDate.setHours(0, 0, 0, 0);

    const dateStr = recordDate.toISOString().split("T")[0]!;

    const dayBucket = dailyData.get(dateStr);
    if (!dayBucket) continue;

    const auction_results = record.auction_results as AuctionResults;
    if (!auction_results) continue;

    for (const ct in auction_results) {
      if (computeType && ct !== computeType) continue;

      for (const node of auction_results[ct]!) {
        dayBucket.totalPayout += node.payout;
        dayBucket.totalCards += node.count;
        dayBucket.recordCount += 1;
      }
    }
  }

  const result: DailyAveragePayoutData[] = Array.from(dailyData.values())
    .sort((a, b) => a.dayIndex - b.dayIndex)
    .map((day) => ({
      date: day.date,
      dayIndex: day.dayIndex,
      averagePayoutPerCard:
        day.totalCards > 0 ? day.totalPayout / day.totalCards : 0,
      totalPayout: day.totalPayout,
      totalCards: day.totalCards,
    }));

  return result;
}

export const chainRouter = createTRPCRouter({
  getAuctionState: publicAuthlessProcedure
    .input(z.number().optional())
    .query(async ({ input }) => getAuctionState(input)),
  getHistoricalPayoutData: publicAuthlessProcedure
    .input(
      z
        .object({
          days: z.number().optional().default(7),
          computeType: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) =>
      getHistoricalPayoutData(input?.days ?? 7, input?.computeType)
    ),
});
