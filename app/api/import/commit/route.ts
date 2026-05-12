import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, splitwiseEntries, imports } from "@/lib/db/schema";
import type { PreviewRow, SplitwisePreviewRow } from "@/lib/csv/types";

interface TransactionSession {
  accountId: number;
  filename: string;
  rows: PreviewRow[];
}

interface SplitwiseSession {
  filename: string;
  rows: SplitwisePreviewRow[];
}

interface CommitBody {
  transactionSessions: TransactionSession[];
  splitwiseSessions: SplitwiseSession[];
}

interface CommitResult {
  accountId?: number;
  filename: string;
  inserted: number;
  skipped: number;
  type: "transactions" | "splitwise";
}

export async function POST(req: Request) {
  const body: CommitBody = await req.json();
  const { transactionSessions = [], splitwiseSessions = [] } = body;

  const results: CommitResult[] = [];

  // ── Transaction sessions ────────────────────────────────────────────────
  for (const session of transactionSessions) {
    if (session.rows.length === 0) continue;

    const importRow = db
      .insert(imports)
      .values({
        accountId: session.accountId,
        sourceFilename: session.filename,
        rowsTotal: session.rows.length,
        rowsNew: session.rows.length,
        rowsDuplicate: 0,
      })
      .returning()
      .get();

    let inserted = 0;
    let skipped = 0;

    for (const row of session.rows) {
      try {
        db.insert(transactions)
          .values({
            accountId: session.accountId,
            date: row.date,
            postedDate: row.postedDate,
            description: row.description,
            rawDescription: row.rawDescription,
            amount: row.amount,
            categoryId: row.categoryId,
            hash: row.hash,
            importId: importRow.id,
          })
          .run();
        inserted++;
      } catch {
        // UNIQUE constraint on hash = duplicate that slipped past preview
        skipped++;
      }
    }

    results.push({
      accountId: session.accountId,
      filename: session.filename,
      inserted,
      skipped,
      type: "transactions",
    });
  }

  // ── Splitwise sessions ──────────────────────────────────────────────────
  for (const session of splitwiseSessions) {
    if (session.rows.length === 0) continue;

    let inserted = 0;
    let skipped = 0;

    for (const row of session.rows) {
      try {
        db.insert(splitwiseEntries)
          .values({
            date: row.date,
            description: row.description,
            amountPaidByMe: row.amountPaidByMe,
            amountOwedByPartner: row.amountOwedByPartner,
          })
          .run();
        inserted++;
      } catch {
        skipped++;
      }
    }

    results.push({
      filename: session.filename,
      inserted,
      skipped,
      type: "splitwise",
    });
  }

  return NextResponse.json({ ok: true, results });
}
