import { eq, gte, sql } from "drizzle-orm";

import { statsDB } from "@/schema/psDB";
import { Validator, ValidatorRequest } from "@/schema/schema";
import ClientHeader from "./ClientHeader";

export default async function Header() {
  const activeValidators = await statsDB
    .select({
      name: Validator.valiName,
      hotkey: Validator.hotkey,
    })
    .from(Validator)
    .innerJoin(ValidatorRequest, eq(Validator.hotkey, ValidatorRequest.hotkey))
    .where(gte(ValidatorRequest.timestamp, sql`NOW() - INTERVAL 2 HOUR`))
    .groupBy(Validator.valiName, Validator.hotkey);

  const sortedValis = activeValidators
    .map((validator) => validator.name ?? validator.hotkey.substring(0, 5))
    .sort((a, b) => a.localeCompare(b));

  return <ClientHeader validators={sortedValis} />;
}
