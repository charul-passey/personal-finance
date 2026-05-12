import { NextResponse } from "next/server";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { accounts, categories, categoryRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { detectSource } from "@/lib/csv/detect";
import { hashRow, findExistingHashes } from "@/lib/csv/dedup";
import { applyRules, type RuleRecord } from "@/lib/categorize/apply";
import { parse as parseBofa } from "@/lib/csv/parsers/bofa";
import { parse as parseAmex } from "@/lib/csv/parsers/amex";
import { parse as parseChase } from "@/lib/csv/parsers/chase";
import { parse as parseCapitalOne } from "@/lib/csv/parsers/capitalone";
import { parse as parseBilt } from "@/lib/csv/parsers/bilt";
import { parse as parseSplitwise } from "@/lib/csv/parsers/splitwise";
import type {
  CsvSource,
  FileSession,
  PreviewRow,
  SplitwisePreviewRow,
} from "@/lib/csv/types";

// Load rules from DB (synchronous with better-sqlite3)
function loadRules(): RuleRecord[] {
  return db
    .select({
      id: categoryRules.id,
      pattern: categoryRules.pattern,
      matchType: categoryRules.matchType,
      accountId: categoryRules.accountId,
      categoryId: categoryRules.categoryId,
      categoryName: categories.name,
      priority: categoryRules.priority,
    })
    .from(categoryRules)
    .leftJoin(categories, eq(categoryRules.categoryId, categories.id))
    .all()
    .map((r) => ({
      ...r,
      categoryName: r.categoryName ?? "Uncategorized",
    }));
}

function loadAccounts() {
  return db.select().from(accounts).all();
}

// Map detected source to an account in the DB
function resolveAccount(
  source: CsvSource,
  allAccounts: (typeof accounts.$inferSelect)[],
  overrideAccountId?: number
) {
  if (overrideAccountId) {
    return allAccounts.find((a) => a.id === overrideAccountId) ?? null;
  }
  switch (source) {
    case "bofa":
      return (
        allAccounts.find((a) => a.institution === "Bank of America") ?? null
      );
    case "amex":
      return (
        allAccounts.find((a) => a.institution === "American Express") ?? null
      );
    case "capitalone":
      return (
        allAccounts.find((a) => a.institution === "Capital One") ?? null
      );
    case "chase":
      return allAccounts.find((a) => a.institution === "Chase") ?? null;
    case "bilt":
      return allAccounts.find((a) => a.name === "Bilt") ?? null;
    case "splitwise":
      return null;
  }
}

function isBalanceOnly(
  acct: (typeof accounts.$inferSelect) | null
): boolean {
  if (!acct) return false;
  return !acct.trackTransactions;
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  // Optional per-filename account overrides: JSON string of { filename: accountId }
  const overridesRaw = formData.get("overrides");
  const overrides: Record<string, number> = overridesRaw
    ? JSON.parse(overridesRaw as string)
    : {};

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const allAccounts = loadAccounts();
  const rules = loadRules();
  const sessions: FileSession[] = [];

  for (const file of files) {
    const text = await file.text();
    const filename = file.name;

    // Get headers only (header:false + preview:1)
    const { data: rawRows } = Papa.parse<string[]>(text, {
      header: false,
      preview: 1,
    });
    const headers = rawRows[0] ?? [];

    const source = detectSource(headers, filename);
    const overrideId = overrides[filename];
    const account = source ? resolveAccount(source, allAccounts, overrideId) : null;

    // Bilt / balance-only: skip with tip
    if (source === "bilt" || (account && isBalanceOnly(account))) {
      sessions.push({
        filename,
        source,
        accountId: account?.id ?? null,
        accountName: account?.name ?? null,
        ambiguous: false,
        isBiltSkip: true,
        newRows: [],
        duplicateCount: 0,
      });
      continue;
    }

    // Splitwise: no account, separate handling
    if (source === "splitwise") {
      const swRows = parseSplitwise(text);
      const previewRows: SplitwisePreviewRow[] = swRows.map((r) => ({
        date: r.date,
        description: r.description,
        amountPaidByMe: r.amountPaidByMe,
        amountOwedByPartner: r.amountOwedByPartner,
      }));
      sessions.push({
        filename,
        source,
        accountId: null,
        accountName: "Splitwise",
        ambiguous: false,
        isBiltSkip: false,
        newRows: [],
        duplicateCount: 0,
        splitwiseRows: previewRows,
      });
      continue;
    }

    // Ambiguous: no account resolved and no override
    if (!source || !account) {
      sessions.push({
        filename,
        source,
        accountId: null,
        accountName: null,
        ambiguous: true,
        isBiltSkip: false,
        newRows: [],
        duplicateCount: 0,
      });
      continue;
    }

    // Parse with the right parser
    let normalized;
    switch (source) {
      case "bofa":       normalized = parseBofa(text); break;
      case "amex":       normalized = parseAmex(text); break;
      case "chase":      normalized = parseChase(text); break;
      case "capitalone": normalized = parseCapitalOne(text); break;
      default:           normalized = parseBilt(text);
    }

    // Dedup
    const hashes = normalized.map((r) =>
      hashRow(account.id, r.date, r.amount, r.rawDescription)
    );
    const existingHashes = findExistingHashes(hashes);

    // Build preview rows
    const newRows: PreviewRow[] = [];
    let duplicateCount = 0;

    for (let i = 0; i < normalized.length; i++) {
      const row = normalized[i];
      const hash = hashes[i];
      if (existingHashes.has(hash)) {
        duplicateCount++;
        continue;
      }
      const { categoryId, categoryName } = applyRules(
        row.description,
        account.id,
        row.amount,
        rules
      );
      newRows.push({
        hash,
        date: row.date,
        postedDate: row.postedDate,
        description: row.description,
        rawDescription: row.rawDescription,
        amount: row.amount,
        categoryId,
        categoryName,
      });
    }

    sessions.push({
      filename,
      source,
      accountId: account.id,
      accountName: account.name,
      ambiguous: false,
      isBiltSkip: false,
      newRows,
      duplicateCount,
    });
  }

  // Also return available accounts for the ambiguous-file dropdown
  const accountOptions = allAccounts
    .filter((a) => a.trackTransactions)
    .map((a) => ({ id: a.id, name: a.name, institution: a.institution }));

  return NextResponse.json({ sessions, accountOptions });
}
