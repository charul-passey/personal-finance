import { createHash } from "crypto";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export function hashRow(
  accountId: number,
  date: string,
  amountCents: number,
  rawDescription: string
): string {
  return createHash("sha256")
    .update(`${accountId}|${date}|${amountCents}|${rawDescription}`)
    .digest("hex");
}

// Returns the set of hashes that already exist in the DB.
export function findExistingHashes(hashes: string[]): Set<string> {
  if (hashes.length === 0) return new Set();
  const rows = db
    .select({ hash: transactions.hash })
    .from(transactions)
    .where(inArray(transactions.hash, hashes))
    .all();
  return new Set(rows.map((r) => r.hash));
}
