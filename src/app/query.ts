"use server";

import { connectToMongoDb } from "@/schema/mongoDB";
import { type TargonDoc } from "./page";

export async function getMinerData(uid: string): Promise<TargonDoc> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) {
    throw new Error("Failed to connect to MongoDB");
  }

  const targetUid = uid;
  if (!targetUid) {
    throw new Error("Invalid UID");
  }

  const targonCollection = (await mongoDb
    .collection("uid_responses")
    .find({ uid: targetUid })
    .toArray()) as unknown as TargonDoc[];

  const minerDoc = targonCollection[0];
  if (!minerDoc) {
    throw new Error("No data found for this UID");
  }

  // Serialize the document by converting it to a plain object
  const serializedDoc = JSON.parse(JSON.stringify(minerDoc)) as TargonDoc;
  return serializedDoc;
}
