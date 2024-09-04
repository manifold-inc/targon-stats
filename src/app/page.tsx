import { and, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/schema/db";
import { MinerResponse, Validator, ValidatorRequest } from "@/schema/schema";
import ClientPage from "./ClientPage";

export default async function Page({ searchParams }: { searchParams: { verified?: string, validators: string } }) {
  const verified = searchParams.verified === 'true';
  const validators = searchParams.validators || '';

  try {
    let activeValidators: string[] = [];
    if (validators) {
      const allValidators = await db
      .select({ name: Validator.valiName })
      .from(Validator)
      .orderBy(Validator.valiName)

      activeValidators = allValidators
        .filter((_, index) => validators[index] === '1')
        .map(v => v.name)
        .filter(Boolean) as string[];
    }

    const stats = await db
        .select({
          minute:
            sql<string>`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`.mapWith(
              (v: string) => {
                const date = new Date(v);
                const utc = Date.UTC(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  date.getHours(),
                  date.getMinutes(),
                );
                return utc;
              },
            ),
          avg_jaro: sql<number>`
            AVG(
              (SELECT AVG(CAST(jt.value AS DECIMAL))
              FROM JSON_TABLE(${MinerResponse.stats}->'$.jaros', '$[*]' COLUMNS (value DOUBLE PATH '$')) AS jt)
              )`.mapWith(Number),
          avg_wps:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'$.wps' AS DECIMAL))`.mapWith(
              Number,
            ),
          avg_total_time:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'$.total_time' AS DECIMAL(8,5)))`.mapWith(
              Number,
            ),
          avg_time_to_first_token:
            sql<number>`AVG(CAST(${MinerResponse.stats}->'$.time_to_first_token' AS DECIMAL(8,5)))`.mapWith(
              Number,
            ),
          valiName: sql<string | undefined> `IFNULL(${Validator.valiName}, '')`,
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
              ? [
                  sql`(${MinerResponse.stats}->'$.verified') = ${verified}`,
                ]
              : []
            ),
            ...(activeValidators.length > 0)
            ? [inArray(Validator.valiName, activeValidators)]
            : []
          ),
        )
        .groupBy(
          sql`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`,
          Validator.valiName,
        )
        .orderBy(
          sql`DATE_FORMAT(${ValidatorRequest.timestamp}, '%Y-%m-%d %H:%i:00')`,
        );
      return <ClientPage data={stats} initialVerified={verified} initialValidators={activeValidators} />;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return <div> Error fetching stats...</div>
  }
}