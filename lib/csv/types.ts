export interface NormalizedRow {
  date: string          // YYYY-MM-DD
  postedDate?: string
  description: string   // cleaned
  rawDescription: string
  amount: number        // cents, negative = outflow, positive = inflow
}

export interface SplitwiseRow {
  date: string
  description: string
  amountPaidByMe: number   // cents
  amountOwedByPartner: number // cents (positive = they owe me)
}

export type CsvSource =
  | "bofa"
  | "amex"
  | "chase"
  | "capitalone"
  | "bilt"
  | "splitwise";

// Shared preview + commit shapes used by both API and UI
export interface PreviewRow {
  hash: string
  date: string
  postedDate?: string
  description: string
  rawDescription: string
  amount: number        // cents
  categoryId: number | null
  categoryName: string | null
}

export interface SplitwisePreviewRow {
  date: string
  description: string
  amountPaidByMe: number
  amountOwedByPartner: number
}

export interface FileSession {
  filename: string
  source: CsvSource | null
  accountId: number | null
  accountName: string | null
  ambiguous: boolean    // true when detection failed
  isBiltSkip: boolean   // balance-only account, skip transactions
  newRows: PreviewRow[]
  duplicateCount: number
  splitwiseRows?: SplitwisePreviewRow[]
}

export interface AccountOption {
  id: number
  name: string
  institution: string
}
