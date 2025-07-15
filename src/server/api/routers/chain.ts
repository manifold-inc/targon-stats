import { connectToMongoDb } from "@/schema/mongoDB";
import { createTRPCRouter, publicAuthlessProcedure } from "../trpc";

const getCurrentBlock = publicAuthlessProcedure.query(async () => {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find({})
    .sort({ block: -1 })
    .limit(1)
    .toArray();
  if (!data[0]) throw new Error("Failed to get current block");

  return data[0].block as number;
});

export const chainRouter = createTRPCRouter({
  getCurrentBlock,
});
