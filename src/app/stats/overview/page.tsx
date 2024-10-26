import { gte, sql } from "drizzle-orm";

import { db } from "@/schema/db";
import { MinerResponseHistoricalStats } from "@/schema/schema";
import ClientPage from "./ClientPage";

export const revalidate = 60 * 60 * 24;

export default async function PageContent() {
  try {
    const historicalStats = await db
      .select({
        date: MinerResponseHistoricalStats.date,
        avgTimeToFirstToken: MinerResponseHistoricalStats.avgTimeToFirstToken,
        avgTimeForAllTokens: MinerResponseHistoricalStats.avgTimeForAllTokens,
        avgTotalTime: MinerResponseHistoricalStats.avgTotalTime,
        avgTPS: MinerResponseHistoricalStats.avgTPS,
        totalTokens: MinerResponseHistoricalStats.totalTokens,
      })
      .from(MinerResponseHistoricalStats)
      .where(
        gte(
          MinerResponseHistoricalStats.date,
          sql`CURDATE() - INTERVAL 30 DAY`,
        ),
      );

    return <ClientPage data={historicalStats} />;
  } catch (error) {
    console.error("Error fetching historical stats:", error);
    return <div>Error fetching historical stats...</div>;
  }
}
