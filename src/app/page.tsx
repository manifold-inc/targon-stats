import { Suspense } from "react";
import { and, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/schema/db";
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

  try {
    const activeValidators = await db
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

    const innerAvg = db
      .select({
        minute:
          sql<string>`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`
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
        // TODO: Consider using avg() instead of sql<number> when deploy request is completed and data truncates
        avg_tps: sql<number>`AVG(${MinerResponse.tps})`.as("avg_tps"),
        avg_time_to_first_token: sql<number>`AVG(${MinerResponse.timeToFirstToken})`.as("avg_time_to_first_token"),
        avg_time_for_all_tokens: sql<number>`AVG(${MinerResponse.timeForAllTokens})`.as("avg_time_for_all_tokens"),
        avg_total_time: sql<number>`AVG(${MinerResponse.totalTime})`.as("avg_total_time"),
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
          // TODO: Uncomment this when we have recent data lol
          /* gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 2 HOUR`), */
          ...(verified ? [eq(MinerResponse.verified, verified)] : []),
          ...(selectedValidators.length > 0
            ? [inArray(Validator.valiName, selectedValidators)]
            : []),
        ),
      )
      .groupBy(
        sql`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`,
        Validator.valiName,
      )
      .as("innerAvg");

    const orderedStats = await db
      .select()
      .from(innerAvg)
      .orderBy(innerAvg.minute);

    return (
      <ClientPage
        data={orderedStats}
        initialVerified={verified}
        initialValidators={selectedValidators}
      />
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return <div> Error fetching stats...</div>;
  }
}
