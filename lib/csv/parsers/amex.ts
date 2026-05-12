import Papa from "papaparse";
import type { NormalizedRow } from "../types";

// Amex Gold CSV format:
//   Date, Description, Amount, Extended Details, Appears On Your Statement As, ...
//   Amounts: POSITIVE = charge (outflow), NEGATIVE = credit (payment/refund)
//   We negate so negative = outflow matches our convention.

export function parse(csvText: string): NormalizedRow[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row): NormalizedRow | null => {
      const base = (row["Description"] ?? "").trim();
      const ext = (row["Extended Details"] ?? "").trim();
      // Use extended details if it adds merchant info beyond the base description
      const raw = base;
      const description =
        ext && ext !== base && !base.toLowerCase().includes(ext.toLowerCase())
          ? `${base} — ${ext}`
          : base;

      const amountStr = row["Amount"] ?? "";
      const parsed = parseFloat(amountStr.replace(/[$,\s]/g, ""));
      if (isNaN(parsed)) return null;

      // Amex: positive = charge (outflow) → we store as negative
      const amount = Math.round(-parsed * 100);

      return {
        date: parseDate(row["Date"] ?? ""),
        description,
        rawDescription: raw,
        amount,
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
