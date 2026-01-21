import { z } from "zod";

import { type MinerNode } from "@/app/_components/MinerTable";
import { connectToMongoDb } from "@/schema/mongoDB";
import { createTRPCRouter, publicAuthlessProcedure } from "@/server/api/trpc";
import { removeIPAddress } from "@/utils/utils";

export type Auction = Record<string, MinerNode[]>;
export interface AuctionState {
  auction_results: Auction;
  emission_pool: number;
  block: number;
  tao_price: number;
  timestamp: Date;
  weights: { uids: number[]; incentives: number[] };
  hotkey_to_uid: Record<string, string>;
}

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

  const auction_results = data.auction_results as Auction;
  const parsedNodes: Auction = {};

  for (const gpu in auction_results) {
    parsedNodes[gpu] = auction_results[gpu]!.map((node: MinerNode) =>
      removeIPAddress(node),
    );
  }

  const hotkeyToUid = data.hotkey_to_uid as Record<string, string>;
  const uidToHotkey: Record<string, string> = {};
  for (const [hotkey, uid] of Object.entries(hotkeyToUid)) {
    uidToHotkey[uid] = hotkey;
  }

  const state: AuctionState = {
    auction_results: parsedNodes,
    emission_pool: data.emission_pool as number,
    block: data.block as number,
    tao_price: data.tao_price as number,
    timestamp: data.timestamp as Date,
    weights: data.weights as { uids: number[]; incentives: number[] },
    hotkey_to_uid: uidToHotkey,
  };
  return state;
}

export const chainRouter = createTRPCRouter({
  getAuctionState: publicAuthlessProcedure
    .input(z.number().optional())
    .query(async ({ input }) => getAuctionState(input)),
});
