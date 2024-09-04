import { eq, gte, sql } from "drizzle-orm";

import { db } from "@/schema/db";
import { Validator, ValidatorRequest } from "@/schema/schema";
import HeaderClient from "./HeaderClient";

export default async function ServerHeader() {
  const activeValidators = await db
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

  return <HeaderClient validators={sortedValis} />;
}
