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

  // Track UIDs that have cards
  const uidsWithCards = new Set<string>();

  for (const gpu in auction_results) {
    parsedNodes[gpu] = auction_results[gpu]!.map((node: MinerNode) =>
      removeIPAddress(node)
    ).filter((node: MinerNode) => {
      if (node.count > 0) {
        uidsWithCards.add(node.uid);
        return true;
      }
      return false;
    });
  }

  const hotkeyToUid = data.hotkey_to_uid as Record<string, string>;
  const uidToHotkey: Record<string, string> = {};
  for (const [hotkey, uid] of Object.entries(hotkeyToUid)) {
    uidToHotkey[uid] = hotkey;
  }

  const weightsData = data.weights as { uids: number[]; incentives: number[] };
  const filteredWeights = weightsData
    ? {
        uids: weightsData.uids.filter((uid) => uidsWithCards.has(String(uid))),
        incentives: weightsData.uids
          .map((uid, index) => ({
            uid,
            incentive: weightsData.incentives[index] ?? 0,
          }))
          .filter(({ uid }) => uidsWithCards.has(String(uid)))
          .map(({ incentive }) => incentive),
      }
    : { uids: [], incentives: [] };

  const state: AuctionState = {
    auction_results: parsedNodes,
    auctions: data.auctions as Record<string, Auction>,
    emission_pool: data.emission_pool as number,
    block: data.block as number,
    tao_price: data.tao_price as number,
    timestamp: data.timestamp as Date,
    weights: filteredWeights,
    hotkey_to_uid: uidToHotkey,
  };
  return state;
}

export type DailyAveragePayoutData = {
  date: string;
  payout: number;
};

export type HistoricalWeightData = {
  date: string;
  weight: number;
};

export type DailyPayoutDataByComputeType = {
  date: string;
  payouts: Record<string, number>;
};

export async function getHistoricalPayoutData(
  days = 30,
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
  const nowUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const minDate = new Date(nowUTC);
  minDate.setUTCDate(minDate.getUTCDate() - (days - 1));
  const blocksPerDay = 360 * 24;
  const blocksToLookBack = days * blocksPerDay;
  const minBlock = Math.max(0, latestBlock - blocksToLookBack);

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
    .toArray();

  if (!data || data.length === 0) {
    return [];
  }

  const dailyData = new Map<
    string,
    { totalPayout: number; totalCards: number }
  >();

  for (let i = 0; i < days; i++) {
    const date = new Date(nowUTC);
    date.setUTCDate(date.getUTCDate() - (days - 1 - i));
    const dateStr = date.toISOString().split("T")[0]!;
    dailyData.set(dateStr, { totalPayout: 0, totalCards: 0 });
  }

  for (const record of data) {
    const recordBlock = record.block as number;
    const blockDiff = latestBlock - recordBlock;
    const estimatedDaysAgo = blockDiff / blocksPerDay;

    const recordDate = new Date(nowUTC);
    recordDate.setUTCDate(
      recordDate.getUTCDate() - Math.round(estimatedDaysAgo)
    );
    recordDate.setUTCHours(0, 0, 0, 0);

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
      }
    }
  }

  return Array.from(dailyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, { totalPayout, totalCards }]) => ({
      date,
      payout: totalCards > 0 ? totalPayout / totalCards : 0,
    }))
    .filter((day) => day.payout > 0);
}

export async function getHistoricalWeightsForMiner(
  uid: string,
  days = 30
): Promise<HistoricalWeightData[]> {
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
  const nowUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const blocksPerDay = 360 * 24;
  const blocksToLookBack = days * blocksPerDay;
  const minBlock = Math.max(0, latestBlock - blocksToLookBack);

  const data = await mongoDb
    .collection("miner_info")
    .find(
      {
        block: { $gte: minBlock, $lte: latestBlock },
      },
      {
        projection: {
          block: 1,
          weights: 1,
        },
      }
    )
    .sort({ block: -1 })
    .toArray();

  if (!data || data.length === 0) {
    return [];
  }

  const dailyData = new Map<string, number[]>();

  for (let i = 0; i < days; i++) {
    const date = new Date(nowUTC);
    date.setUTCDate(date.getUTCDate() - (days - 1 - i));
    const dateStr = date.toISOString().split("T")[0]!;
    dailyData.set(dateStr, []);
  }

  for (const record of data) {
    const recordBlock = record.block as number;
    const blockDiff = latestBlock - recordBlock;
    const estimatedDaysAgo = blockDiff / blocksPerDay;

    const recordDate = new Date(nowUTC);
    recordDate.setUTCDate(
      recordDate.getUTCDate() - Math.round(estimatedDaysAgo)
    );
    recordDate.setUTCHours(0, 0, 0, 0);

    const dateStr = recordDate.toISOString().split("T")[0]!;

    const dayBucket = dailyData.get(dateStr);
    if (!dayBucket) continue;

    const weights = record.weights as { uids: number[]; incentives: number[] };
    if (!weights?.uids || !weights?.incentives) continue;

    const uidIndex = weights.uids.indexOf(Number(uid));
    if (uidIndex !== -1) {
      const incentive = weights.incentives[uidIndex];
      if (incentive !== undefined) {
        dayBucket.push(incentive);
      }
    }
  }

  return Array.from(dailyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, weights]) => {
      const avgWeight =
        weights.length > 0
          ? weights.reduce((sum, w) => sum + w, 0) / weights.length
          : 0;
      return {
        date,
        weight: avgWeight,
      };
    })
    .filter((day) => day.weight > 0);
}

export async function getHistoricalPayoutDataByComputeType(
  days = 30
): Promise<DailyPayoutDataByComputeType[]> {
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
  const nowUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const minDate = new Date(nowUTC);
  minDate.setUTCDate(minDate.getUTCDate() - (days - 1));
  const blocksPerDay = 360 * 24;
  const blocksToLookBack = days * blocksPerDay;
  const minBlock = Math.max(0, latestBlock - blocksToLookBack);

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
    .toArray();

  if (!data || data.length === 0) {
    return [];
  }

  const dailyData = new Map<
    string,
    Map<string, { totalPayout: number; totalCards: number }>
  >();

  for (let i = 0; i < days; i++) {
    const date = new Date(nowUTC);
    date.setUTCDate(date.getUTCDate() - (days - 1 - i));
    const dateStr = date.toISOString().split("T")[0]!;
    dailyData.set(dateStr, new Map());
  }

  for (const record of data) {
    const recordBlock = record.block as number;
    const blockDiff = latestBlock - recordBlock;
    const estimatedDaysAgo = blockDiff / blocksPerDay;

    const recordDate = new Date(nowUTC);
    recordDate.setUTCDate(
      recordDate.getUTCDate() - Math.round(estimatedDaysAgo)
    );
    recordDate.setUTCHours(0, 0, 0, 0);

    const dateStr = recordDate.toISOString().split("T")[0]!;

    const dayBucket = dailyData.get(dateStr);
    if (!dayBucket) continue;

    const auction_results = record.auction_results as AuctionResults;
    if (!auction_results) continue;

    for (const ct in auction_results) {
      if (!dayBucket.has(ct)) {
        dayBucket.set(ct, { totalPayout: 0, totalCards: 0 });
      }

      const computeTypeBucket = dayBucket.get(ct)!;

      for (const node of auction_results[ct]!) {
        computeTypeBucket.totalPayout += node.payout;
        computeTypeBucket.totalCards += node.count;
      }
    }
  }

  return Array.from(dailyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, computeTypeMap]) => {
      const payouts: Record<string, number> = {};
      for (const [computeType, { totalPayout, totalCards }] of computeTypeMap) {
        if (totalCards > 0) {
          payouts[computeType] = totalPayout / totalCards;
        }
      }
      return {
        date,
        payouts,
      };
    })
    .filter((day) => Object.keys(day.payouts).length > 0);
}

export const chainRouter = createTRPCRouter({
  getAuctionState: publicAuthlessProcedure
    .input(z.number().optional())
    .query(async ({ input }) => getAuctionState(input)),
  getHistoricalPayoutData: publicAuthlessProcedure
    .input(
      z
        .object({
          days: z.number().optional().default(30),
          computeType: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) =>
      getHistoricalPayoutData(input?.days ?? 30, input?.computeType)
    ),
  getHistoricalWeightsForMiner: publicAuthlessProcedure
    .input(
      z.object({
        uid: z.string(),
        days: z.number().optional().default(30),
      })
    )
    .query(async ({ input }) =>
      getHistoricalWeightsForMiner(input.uid, input.days ?? 30)
    ),
  getHistoricalPayoutDataByComputeType: publicAuthlessProcedure
    .input(
      z
        .object({
          days: z.number().optional().default(30),
        })
        .optional()
    )
    .query(async ({ input }) =>
      getHistoricalPayoutDataByComputeType(input?.days ?? 30)
    ),
});
