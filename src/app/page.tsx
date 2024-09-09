import { and, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/schema/db";
import { MinerResponse, Validator, ValidatorRequest } from "@/schema/schema";
import ClientPage from "./ClientPage";

interface PageProps {
  searchParams?: {
    verified?: string;
    validators?: string;
  };
}
export const revalidate = 60 * 5;

export default async function Page({ searchParams = {} }: PageProps) {
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
        avg_wps:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL))`
            .mapWith(Number)
            .as("avg_wps"),
        avg_total_time:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'$.total_time' AS DECIMAL(8,5)))`
            .mapWith(Number)
            .as("avg_total_time"),
        avg_time_to_first_token:
          sql<number>`AVG(CAST(${MinerResponse.stats}->'$.time_to_first_token' AS DECIMAL(8,5)))`
            .mapWith(Number)
            .as("avg_time_to_first_token"),
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
          gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 2 HOUR`),
          ...(verified
            ? [sql`(${MinerResponse.stats}->'$.verified') = ${verified}`]
            : []),
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
