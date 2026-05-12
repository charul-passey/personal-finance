import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  institution: text("institution").notNull(),
  type: text("type").notNull(), // 'checking' | 'credit_full' | 'credit_balance_only' | 'loan'
  last4: text("last4"),
  currency: text("currency").notNull().default("USD"),
  trackTransactions: integer("track_transactions", { mode: "boolean" })
    .notNull()
    .default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  color: text("color"),
  monthlyBudget: integer("monthly_budget"), // in cents
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  date: text("date").notNull(), // YYYY-MM-DD
  postedDate: text("posted_date"),
  description: text("description").notNull(),
  rawDescription: text("raw_description").notNull(),
  amount: integer("amount").notNull(), // cents, negative = outflow
  categoryId: integer("category_id").references(() => categories.id),
  hash: text("hash").notNull().unique(),
  importId: integer("import_id"),
  notes: text("notes"),
  isTransfer: integer("is_transfer", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const statementBalances = sqliteTable("statement_balances", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  statementDate: text("statement_date").notNull(),
  balance: integer("balance").notNull(), // cents
  paymentDueDate: text("payment_due_date"),
  minimumDue: integer("minimum_due"),
});

export const categoryRules = sqliteTable("category_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pattern: text("pattern").notNull(),
  matchType: text("match_type").notNull(), // 'contains' | 'regex' | 'exact'
  accountId: integer("account_id").references(() => accounts.id),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  priority: integer("priority").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const splits = sqliteTable("splits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  transactionId: integer("transaction_id")
    .notNull()
    .unique()
    .references(() => transactions.id),
  mySharePct: real("my_share_pct").notNull().default(50),
  splitwiseId: integer("splitwise_id"),
  matchedAutomatically: integer("matched_automatically", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const splitwiseEntries = sqliteTable("splitwise_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  description: text("description").notNull(),
  amountPaidByMe: integer("amount_paid_by_me").notNull(), // cents
  amountOwedByPartner: integer("amount_owed_by_partner").notNull(), // cents
  matchedTransactionId: integer("matched_transaction_id").references(
    () => transactions.id
  ),
});

export const loanBalances = sqliteTable("loan_balances", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  snapshotDate: text("snapshot_date").notNull(),
  inrBalance: integer("inr_balance").notNull(), // paise
});

export const loanRemittances = sqliteTable("loan_remittances", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  usdSent: integer("usd_sent").notNull(), // cents
  inrReceived: integer("inr_received"), // paise
  transactionId: integer("transaction_id").references(() => transactions.id),
  notes: text("notes"),
});

export const fxRates = sqliteTable("fx_rates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  base: text("base").notNull(),
  quote: text("quote").notNull(),
  rate: real("rate").notNull(),
  fetchedAt: text("fetched_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const imports = sqliteTable("imports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  sourceFilename: text("source_filename").notNull(),
  importedAt: text("imported_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  rowsTotal: integer("rows_total").notNull().default(0),
  rowsNew: integer("rows_new").notNull().default(0),
  rowsDuplicate: integer("rows_duplicate").notNull().default(0),
});
