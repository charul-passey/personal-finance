import type { NormalizedRow } from "../types";

// Bilt is a balance-only account — we never import its transactions.
// If the user drops a Bilt CSV, the detect + preview pipeline will mark
// isBiltSkip=true and show a tip instead of a row table.

// This parser intentionally returns an empty array; it exists so the import
// pipeline can call parse(source, text) uniformly without a special-case.
export function parse(_csvText: string): NormalizedRow[] {
  return [];
}
