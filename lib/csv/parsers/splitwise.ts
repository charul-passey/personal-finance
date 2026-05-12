import Papa from "papaparse";
import type { SplitwiseRow } from "../types";

// Splitwise export format:
//   Date, Description, Category, Cost, Currency, <Name1>, <Name2>, ...
//
// The user columns after "Currency" are named after participants. We detect
// which column is "me" (Charul) by looking for the name, falling back to the
// first user column. Amounts: positive = paid / owed-to-me.

const MY_NAMES = ["charul", "charul passey"];

export function parse(csvText: string): SplitwiseRow[] {
  const { data, meta } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (data.length === 0) return [];

  const headers = meta.fields ?? [];
  // Known leading columns; user columns come after "Currency"
  const currencyIdx = headers.findIndex(
    (h) => h.toLowerCase().trim() === "currency"
  );
  if (currencyIdx === -1) return [];

  const userCols = headers.slice(currencyIdx + 1).filter(Boolean);
  if (userCols.length < 2) return [];

  // Find my column — prefer an explicit name match
  const myCol =
    userCols.find((c) => MY_NAMES.includes(c.toLowerCase().trim())) ??
    userCols[0];
  const partnerCol = userCols.find((c) => c !== myCol) ?? userCols[1];

  return data
    .map((row): SplitwiseRow | null => {
      const dateStr = row["Date"] ?? "";
      const description = (row["Description"] ?? "").trim();
      const myAmt = parseCents(row[myCol] ?? "");
      const partnerAmt = parseCents(row[partnerCol] ?? "");

      if (isNaN(myAmt) || isNaN(partnerAmt)) return null;
      // Skip zero rows (deleted expenses Splitwise sometimes includes)
      if (myAmt === 0 && partnerAmt === 0) return null;

      return {
        date: parseDate(dateStr),
        description,
        amountPaidByMe: myAmt,
        amountOwedByPartner: partnerAmt,
      };
    })
    .filter((r): r is SplitwiseRow => r !== null && r.date !== "");
}

function parseCents(s: string): number {
  const n = parseFloat(s.replace(/[$,\s]/g, ""));
  return isNaN(n) ? NaN : Math.round(n * 100);
}

function parseDate(s: string): string {
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return "";
}
