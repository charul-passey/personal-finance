import Papa from "papaparse";
import type { NormalizedRow } from "../types";

// Chase CSV format (Sapphire / Amazon):
//   Transaction Date, Post Date, Description, Category, Type, Amount, Memo
//   Amounts: negative = charge (outflow), positive = credit — matches our convention.

export function parse(csvText: string): NormalizedRow[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row): NormalizedRow | null => {
      const raw = (row["Description"] ?? "").trim();
      const amountStr = row["Amount"] ?? "";
      const parsed = parseFloat(amountStr.replace(/[$,\s]/g, ""));
      if (isNaN(parsed)) return null;

      const txDate = parseDate(row["Transaction Date"] ?? "");
      const postDate = parseDate(row["Post Date"] ?? "");

      return {
        date: txDate,
        postedDate: postDate || undefined,
        description: raw,
        rawDescription: raw,
        amount: Math.round(parsed * 100),
      };
    })
    .filter((r): r is NormalizedRow => r !== null && r.date !== "");
}

function parseDate(s: string): string {
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return "";
}
