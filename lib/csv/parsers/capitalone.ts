import Papa from "papaparse";
import type { NormalizedRow } from "../types";

// Capital One Venture X CSV format:
//   Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit
//   Debit column: outflow (positive number → we store as negative cents)
//   Credit column: inflow / refund (positive number → we store as positive cents)

export function parse(csvText: string): NormalizedRow[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row): NormalizedRow | null => {
      const raw = (row["Description"] ?? "").trim();
      const debitStr = (row["Debit"] ?? "").trim();
      const creditStr = (row["Credit"] ?? "").trim();

      const debit = debitStr ? parseFloat(debitStr.replace(/[$,]/g, "")) : 0;
      const credit = creditStr ? parseFloat(creditStr.replace(/[$,]/g, "")) : 0;
      if (isNaN(debit) || isNaN(credit)) return null;

      // outflow = negative, inflow = positive
      const amount = Math.round((credit - debit) * 100);

      const txDate = parseDate(row["Transaction Date"] ?? "");
      const postDate = parseDate(row["Posted Date"] ?? "");

      return {
        date: txDate,
        postedDate: postDate || undefined,
        description: raw,
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
