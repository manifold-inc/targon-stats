import { connectToMongoDb } from "@/schema/mongoDB";
import { createTRPCRouter, publicAuthlessProcedure } from "@/server/api/trpc";

type Auction = Record<string, MinerNode[]>;

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

export const bidsRouter = createTRPCRouter({
  getAllBids: publicAuthlessProcedure.query(async () => {
    return await getAllBids();
  }),
});
