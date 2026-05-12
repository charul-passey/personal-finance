import Papa from "papaparse";
import type { NormalizedRow } from "../types";

// BofA Checking CSV format:
//   Date, Description, Amount, Running Bal.
//   Amounts: positive = credit/inflow, negative = debit/outflow — matches our convention.

export function parse(csvText: string): NormalizedRow[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row): NormalizedRow | null => {
      const raw = (row["Description"] ?? "").trim();
      const amountStr = row["Amount"] ?? "";
      const amount = parseCents(amountStr);
      if (isNaN(amount)) return null;

      return {
        date: parseDate(row["Date"] ?? ""),
        description: cleanDescription(raw),
        rawDescription: raw,
        amount,
      };
    })
    .filter((r): r is NormalizedRow => r !== null && r.date !== "");
}

function cleanDescription(s: string): string {
  return s
    .replace(/\s+CONF#\s*\S+/gi, "")
    .replace(/\s+REF#\s*\S+/gi, "")
    .replace(/\s+#\d{8,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseDate(s: string): string {
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return "";
}

function parseCents(s: string): number {
  const n = parseFloat(s.replace(/[$,\s]/g, ""));
  return isNaN(n) ? NaN : Math.round(n * 100);
}
