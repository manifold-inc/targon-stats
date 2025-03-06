import { and, eq, gte, sql } from "drizzle-orm";

import { statsDB } from "@/schema/psDB";
import { Validator, ValidatorRequest } from "@/schema/schema";
import ClientPage from "./ClientPage";

export const revalidate = 60 * 5;

export default async function PageContent() {
  try {
    const validatorStats = await statsDB
      .select({
        hotkey: Validator.hotkey,
        valiName: Validator.valiName,
        models: Validator.models,
        requestCount: sql<string>`COUNT(${ValidatorRequest.r_nanoid})`.as(
          "requestCount",
        ),
        scores: Validator.scores,
        lastUpdated: Validator.lastUpdated,
      })
      .from(Validator)
      .leftJoin(
        ValidatorRequest,
        and(
          eq(Validator.hotkey, ValidatorRequest.hotkey),
          gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 1 DAY`),
        ),
      )
      .groupBy(Validator.hotkey);

    return <ClientPage data={validatorStats} />;
  } catch (error) {
    console.error("Error fetching validator stats:", error);
    return <div> Error fetching validator stats...</div>;
  }
}
