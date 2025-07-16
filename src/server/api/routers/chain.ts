import { z } from "zod";

import { type MinerNode } from "@/app/api/bids/route";
import { connectToMongoDb } from "@/schema/mongoDB";
import { createTRPCRouter, publicAuthlessProcedure } from "@/server/api/trpc";
import { removeIPAddress } from "@/utils/utils";

export type Auction = Record<string, MinerNode[]>;

export interface AuctionState {
  auction_results: Auction;
  emission_pool: number;
  block: number;
  max_bid: number;
  tao_price: number;
  timestamp: Date;
  weights: Record<string, number[]>;
}

export async function getAuctionState(block?: number): Promise<AuctionState> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find(block === undefined ? {} : { block })
    .sort({ block: -1 })
    .limit(1)
    .toArray();

  if (!data[0]) {
    throw new Error("Failed to get auction for block " + (block ?? "latest"));
  }

  const auction_results = data[0].auction_results as Auction;
  const parsedNodes: Auction = {};

  for (const gpu in auction_results) {
    parsedNodes[gpu] = auction_results[gpu]!.map((node: MinerNode) =>
      removeIPAddress(node),
    );
  }

  const state: AuctionState = {
    auction_results: parsedNodes,
    emission_pool: data[0].emission_pool as number,
    block: data[0].block as number,
    max_bid: data[0].max_bid as number,
    tao_price: data[0].tao_price as number,
    timestamp: data[0].timestamp as Date,
    weights: data[0].weights as Record<string, number[]>,
  };

  return state;
}

export const chainRouter = createTRPCRouter({
  getAuctionState: publicAuthlessProcedure
    .input(z.number().optional())
    .query(async ({ input }) => getAuctionState(input)),
});
