import type { CsvSource } from "./types";

// Identify institution from CSV header row + filename
export function detectSource(
  headers: string[],
  filename: string
): CsvSource | null {
  const h = headers.map((x) => x.toLowerCase().trim());
  const hSet = new Set(h);

  // BofA: unique "running bal." column
  if (hSet.has("running bal.") || hSet.has("running bal")) return "bofa";

  // Splitwise: has "cost" + "currency" (before chase, which also has no "cost")
  if (hSet.has("cost") && hSet.has("currency")) return "splitwise";

  // Amex: unique "extended details" or "appears on your statement as"
  if (h.some((x) => x.includes("extended details"))) return "amex";
  if (h.some((x) => x.includes("appears on your statement"))) return "amex";

  // Capital One: separate debit/credit columns + card no.
  if (hSet.has("card no.") || (hSet.has("debit") && hSet.has("credit")))
    return "capitalone";

  // Chase: transaction date + post date + memo (or type)
  if (
    hSet.has("transaction date") &&
    hSet.has("post date") &&
    (hSet.has("memo") || hSet.has("type"))
  )
    return "chase";

  // Filename fallbacks
  const fn = filename.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fn.includes("bofa") || fn.includes("bankofamerica") || fn.includes("checking"))
    return "bofa";
  if (fn.includes("amex") || fn.includes("americanexpress")) return "amex";
  if (fn.includes("capitalone") || fn.includes("venturex")) return "capitalone";
  if (fn.includes("bilt")) return "bilt";
  if (fn.includes("splitwise")) return "splitwise";
  if (fn.includes("chase")) return "chase";

  return null;
}
