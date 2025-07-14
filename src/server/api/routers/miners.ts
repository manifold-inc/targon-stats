import { z } from "zod";

import { connectToMongoDb } from "@/schema/mongoDB";
import { createTRPCRouter, publicAuthlessProcedure } from "@/server/api/trpc";

type Auction = Record<string, MinerNode[]>;

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

export type MinerNode = {
  uid: string;
  price: number;
  payout: number;
  gpus: number;
  diluted: boolean;
};

export async function getAllBids(): Promise<MinerNode[]> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find({ auction_results: { $exists: true, $ne: [] } })
    .project({ auction_results: 1, _id: 0 })
    .sort({ block: -1 })
    .limit(1)
    .toArray();
  const auction_results = data[0]?.auction_results as unknown as Auction;
  const miners: MinerNode[] = [];
  for (const gpu in auction_results) {
    for (const miner of auction_results[gpu]!) {
      const minernode = {
        gpus: miner.gpus,
        payout: miner.payout,
        uid: miner.uid,
        price: miner.price,
        diluted: miner.diluted,
      } as MinerNode;
      miners.push(minernode);
    }
  }

  return miners;
}

export async function getAllMiners(): Promise<Miner[]> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find({ auction_results: { $exists: true, $ne: [] } })
    .project({ auction_results: 1, _id: 0 })
    .sort({ block: -1 })
    .limit(1)
    .toArray();
  const auction_results = data[0]?.auction_results as unknown as Auction;
  const miners: Record<string, Miner> = {};

  for (const gpu in auction_results) {
    for (const miner of auction_results[gpu]!) {
      if (!miners[miner.uid]) {
        miners[miner.uid] = {
          uid: miner.uid,
          average_price: miner.price,
          total_price: miner.price,
          average_payout: miner.payout,
          total_payout: miner.payout,
          gpus: miner.gpus,
          nodes: 1,
          diluted: miner.diluted,
        };
        continue;
      }
      miners[miner.uid]!.total_price += miner.price;
      miners[miner.uid]!.total_payout += miner.payout;
      miners[miner.uid]!.nodes += 1;
    }
  }

  return Object.values(miners).map((miner) => ({
    ...miner,
    average_price: miner.total_price / miner.nodes,
    average_payout: miner.total_payout / miner.nodes,
  }));
}

export async function getMiner(uid: string): Promise<MinerNode[]> {
  const auction_results = await getAllBids();
  return auction_results.filter((b) => b.uid === uid);
}

export const minersRouter = createTRPCRouter({
  getAllMiners: publicAuthlessProcedure.query(async () => {
    return await getAllMiners();
  }),

  getMiner: publicAuthlessProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getMiner(input);
    }),

  getAllNodes: publicAuthlessProcedure.query(async () => {
    return await getAllBids();
  }),
});
