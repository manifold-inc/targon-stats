"use server";

import { connectToMongoDb } from "@/schema/mongoDB";

export async function getAuctionResults() {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const block_info = await mongoDb
    .collection("miner_info")
    .find({ [`auction_results`]: { $exists: true, $ne: [] } })
    .project({ [`auction_results`]: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  return block_info;
}
