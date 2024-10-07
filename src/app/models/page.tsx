import { db } from "@/schema/db";
import { Validator } from "@/schema/schema";
import ClientPage from "./ClientPage";

export const revalidate = 60 * 5;

export default async function PageContent() {
  try {
    const valiModels = await db.select().from(Validator);

    return <ClientPage data={valiModels} />;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return <div> Error fetching stats...</div>;
  }
}
