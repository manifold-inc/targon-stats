import { Suspense } from "react";
import { and, avg, eq, gte, inArray, sql } from "drizzle-orm";

import { getMongoDb } from "@/schema/mongoDB";
import { statsDB } from "@/schema/psDB";
import { MinerResponse, Validator, ValidatorRequest } from "@/schema/schema";
import ClientPage from "./ClientPage";
import Loading from "./loading";

interface PageProps {
  searchParams?: {
    verified?: string;
    validators?: string;
  };
}
export const revalidate = 60 * 5;

interface TargonDoc {
  _id: string;
  uid: number;
  last_updated: number;
  models: string[];
  gpus: {
    h100: number;
    h200: number;
  };
  [key: string]:
    | {
        miner_cache: {
          weight: number;
          nodes_endpoint_error: string | null;
          models: string[];
          gpus: {
            h100: number;
            h200: number;
          } | null;
        };
      }
    | string
    | number
    | string[]
    | { h100: number; h200: number };
}

export default function Page({ searchParams = {} }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PageContent({ searchParams = {} }: PageProps) {
  const verified = searchParams.verified === "true";
  const validatorFlags = searchParams.validators || "";

  const mongoDb = getMongoDb();
  const targonCollection = (await mongoDb
    .collection("uid_responses")
    .find({})
    .toArray()) as unknown as TargonDoc[];

  let totalGPUs = { h100: 0, h200: 0 };

  try {
    totalGPUs = targonCollection.reduce(
      (acc, validator) => {
        if (
          "targon-hub-api" in validator &&
          typeof validator["targon-hub-api"] === "object" &&
          "miner_cache" in validator["targon-hub-api"] &&
          validator["targon-hub-api"].miner_cache?.gpus
        ) {
          const gpus = validator["targon-hub-api"].miner_cache.gpus;
          return {
            h100: (acc.h100 || 0) + (gpus.h100 || 0),
            h200: (acc.h200 || 0) + (gpus.h200 || 0),
          };
        }
        return acc;
      },
      { h100: 0, h200: 0 },
    );
  } catch (error) {
    console.error("Error calculating GPU stats:", error);
  }

  try {
    const activeValidators = await statsDB
      .select({
        name: Validator.valiName,
        hotkey: Validator.hotkey,
      })
      .from(Validator)
      .innerJoin(
        ValidatorRequest,
        eq(Validator.hotkey, ValidatorRequest.hotkey),
      )
      .where(gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 2 HOUR`))
      .groupBy(Validator.valiName, Validator.hotkey);

    const sortedValis = activeValidators
      .map((validator) => validator.name ?? validator.hotkey.substring(0, 5))
      .sort((a, b) => a.localeCompare(b));

    const selectedValidators = sortedValis.filter(
      (_, index) => validatorFlags[index] === "1",
    );

    const innerAvg = statsDB
      .select({
        minute:
          sql<string>`DATE_FORMAT(${MinerResponse.timestamp}, '%Y-%m-%d %H:%i:00')`
            .mapWith((v: string) => {
              const date = new Date(v);
              const utc = Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
              );
              return utc;
            })
            .as("minute"),
        avg_tps: avg(MinerResponse.tps).as("avg_tps"),
        avg_time_to_first_token: avg(MinerResponse.timeToFirstToken).as(
          "avg_time_to_first_token",
        ),
        avg_time_for_all_tokens: avg(MinerResponse.timeForAllTokens).as(
          "avg_time_for_all_tokens",
        ),
        valiName: Validator.valiName,
      })
      .from(MinerResponse)
      .innerJoin(
        ValidatorRequest,
        eq(ValidatorRequest.r_nanoid, MinerResponse.r_nanoid),
      )
      .innerJoin(Validator, eq(Validator.hotkey, ValidatorRequest.hotkey))
      .where(
        and(
          gte(MinerResponse.timestamp, sql`NOW() - INTERVAL 2 HOUR`),
          ...(verified ? [eq(MinerResponse.verified, verified)] : []),
          ...(selectedValidators.length > 0
            ? [inArray(Validator.valiName, selectedValidators)]
            : []),
        ),
      )
      .groupBy(
        sql`DATE_FORMAT(${MinerResponse.timestamp}, '%Y-%m-%d %H:%i:00')`,
        Validator.valiName,
      )
      .as("innerAvg");

    const orderedStats = await statsDB
      .select()
      .from(innerAvg)
      .orderBy(innerAvg.minute);

    const valiModels = await statsDB.select().from(Validator);

    const mappedStats = orderedStats.map((stat) => ({
      ...stat,
      avg_tps: Number(stat.avg_tps),
      avg_time_to_first_token: Number(stat.avg_time_to_first_token),
      avg_time_for_all_tokens: Number(stat.avg_time_for_all_tokens),
    }));

    return (
      <ClientPage
        data={mappedStats}
        initialVerified={verified}
        initialValidators={selectedValidators}
        valiModels={valiModels}
        gpuStats={totalGPUs}
      />
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return <div>Error fetching stats...</div>;
  }
}
