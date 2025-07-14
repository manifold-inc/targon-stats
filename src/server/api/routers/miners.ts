import { connectToMongoDb } from "@/schema/mongoDB";
import { createTRPCRouter, publicAuthlessProcedure } from "@/server/api/trpc";

type Auction = Record<
  string,
  { uid: string; price: number; gpus: number; payout: number }[]
>;

export type Miner = {
  uid: string;
  average_price: number;
  total_price: number;
  average_payout: number;
  total_payout: number;
  gpus: number;
  count: number;
};

async function getAuctionResults(): Promise<Auction> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find({ auction_results: { $exists: true, $ne: [] } })
    .project({ auction_results: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  return data[0]?.auction_results as unknown as Auction;
}

async function getPaidMiners(): Promise<Miner[]> {
  const auction_results = await getAuctionResults();
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
          count: 1,
        };
      }
      miners[miner.uid]!.total_price += miner.price;
      miners[miner.uid]!.total_payout += miner.payout;
      miners[miner.uid]!.count += 1;
    }
  }

  return Object.values(miners).map((miner) => ({
    ...miner,
    average_price: miner.total_price / miner.count,
    average_payout: miner.total_payout / miner.count,
  }));
}

export const minersRouter = createTRPCRouter({
  getPaidMiners: publicAuthlessProcedure.query(async () => {
    return await getPaidMiners();
  }),
});
