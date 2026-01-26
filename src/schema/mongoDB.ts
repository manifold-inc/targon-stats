import { env } from "@/env.mjs";
import { type Db, MongoClient, ServerApiVersion } from "mongodb";

// Create a MongoClient with a MongoClientOptions object
const client = new MongoClient(env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db: Db | null = null;

export async function connectToMongoDb() {
  if (db) return db;

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR
    const globalWithMongo = global as typeof globalThis & {
      _mongoDb?: Db;
    };

    if (!globalWithMongo._mongoDb) {
      // Initialize the connection once
      globalWithMongo._mongoDb = await client
        .connect()
        .then((client) => client.db("targon"));
    }
    db = globalWithMongo._mongoDb!;
  } else {
    db = await client.connect().then((client) => client.db("targon"));
  }

  return db;
}

export function getMongoDb() {
  return db;
}

export default client;
