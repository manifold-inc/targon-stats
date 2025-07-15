import { connectToMongoDb } from "@/schema/mongoDB";
import { type MinerNode } from "@/server/api/routers/bids";
import { createTRPCRouter, publicAuthlessProcedure } from "@/server/api/trpc";

export type Auction = Record<string, MinerNode[]>;

const getAuctionState = publicAuthlessProcedure.query(async () => {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find({})
    .sort({ block: -1 })
    .limit(1)
    .toArray();
  if (!data[0]) throw new Error("Failed to get most recent auction");

  return data[0];
});

export const chainRouter = createTRPCRouter({
  getAuctionState,
});
