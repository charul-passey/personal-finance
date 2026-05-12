import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { accounts, categories, categoryRules } from "./schema";

const DB_PATH = path.resolve(process.cwd(), "pace.db");
const MIGRATIONS_PATH = path.resolve(process.cwd(), "lib/db/migrations");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

// Run migrations first
migrate(db, { migrationsFolder: MIGRATIONS_PATH });

// ── Accounts ──────────────────────────────────────────────────────────────────
const existingAccounts = sqlite.prepare("SELECT COUNT(*) as n FROM accounts").get() as { n: number };
if (existingAccounts.n === 0) {
  db.insert(accounts).values([
    {
      name: "BofA Checking",
      institution: "Bank of America",
      type: "checking",
      last4: "9470",
      currency: "USD",
      trackTransactions: true,
    },
    {
      name: "Amex Gold",
      institution: "American Express",
      type: "credit_full",
      last4: "1004",
      currency: "USD",
      trackTransactions: true,
    },
    {
      name: "Venture X",
      institution: "Capital One",
      type: "credit_full",
      last4: "3159",
      currency: "USD",
      trackTransactions: true,
    },
    {
      name: "Amazon Chase",
      institution: "Chase",
      type: "credit_balance_only",
      last4: "5531",
      currency: "USD",
      trackTransactions: false,
    },
    {
      name: "Bilt",
      institution: "Bilt",
      type: "credit_balance_only",
      last4: "2118",
      currency: "USD",
      trackTransactions: false,
    },
    {
      name: "India Loan",
      institution: "HDFC",
      type: "loan",
      last4: "0045",
      currency: "INR",
      trackTransactions: false,
    },
  ]).run();
  console.log("✓ Seeded 6 accounts");
}

// ── Categories ────────────────────────────────────────────────────────────────
const existingCats = sqlite.prepare("SELECT COUNT(*) as n FROM categories").get() as { n: number };
if (existingCats.n === 0) {
  // Insert parents first to get their IDs
  const parents = db.insert(categories).values([
    { name: "Housing", parentId: null, color: "#6366f1" },
    { name: "Food",    parentId: null, color: "#f59e0b" },
    { name: "Transport", parentId: null, color: "#3b82f6" },
    { name: "Shopping",  parentId: null, color: "#ec4899" },
    { name: "Income",    parentId: null, color: "#22c55e" },
  ]).returning().all();

  const byName = Object.fromEntries(parents.map((p) => [p.name, p.id]));

  db.insert(categories).values([
    // Housing
    { name: "Rent",              parentId: byName.Housing,   color: "#818cf8" },
    { name: "Utilities",         parentId: byName.Housing,   color: "#818cf8" },
    { name: "Internet & Phone",  parentId: byName.Housing,   color: "#818cf8" },
    // Food
    { name: "Groceries",         parentId: byName.Food,      color: "#fcd34d" },
    { name: "Dining",            parentId: byName.Food,      color: "#fcd34d" },
    { name: "Coffee",            parentId: byName.Food,      color: "#fcd34d" },
    // Transport
    { name: "Rideshare",         parentId: byName.Transport, color: "#60a5fa" },
    { name: "Transit",           parentId: byName.Transport, color: "#60a5fa" },
    { name: "Travel",            parentId: byName.Transport, color: "#60a5fa" },
    // Shopping
    { name: "Amazon",            parentId: byName.Shopping,  color: "#f472b6" },
    { name: "Personal",          parentId: byName.Shopping,  color: "#f472b6" },
    // Income
    { name: "Salary",            parentId: byName.Income,    color: "#4ade80" },
    { name: "Stock plan",        parentId: byName.Income,    color: "#4ade80" },
    { name: "Other income",      parentId: byName.Income,    color: "#4ade80" },
    // Flat
    { name: "Health",            parentId: null, color: "#f87171" },
    { name: "Subscriptions",     parentId: null, color: "#a78bfa" },
    { name: "Loan remittance",   parentId: null, color: "#fb923c" },
    { name: "Transfer (internal)", parentId: null, color: "#94a3b8" },
    { name: "Uncategorized",     parentId: null, color: "#64748b" },
  ]).run();

  console.log("✓ Seeded categories");
}

// ── Category rules ────────────────────────────────────────────────────────────
const existingRules = sqlite.prepare("SELECT COUNT(*) as n FROM category_rules").get() as { n: number };
if (existingRules.n === 0) {
  // Fetch category IDs we need
  const allCats = sqlite.prepare("SELECT id, name, parent_id FROM categories").all() as { id: number; name: string; parent_id: number | null }[];
  const allAccounts = sqlite.prepare("SELECT id, name FROM accounts").all() as { id: number; name: string }[];

  const catId = (name: string) => {
    const c = allCats.find((c) => c.name === name);
    if (!c) throw new Error(`Category not found: ${name}`);
    return c.id;
  };
  const acctId = (name: string) => {
    const a = allAccounts.find((a) => a.name === name);
    if (!a) throw new Error(`Account not found: ${name}`);
    return a.id;
  };

  db.insert(categoryRules).values([
    // Bilt → Housing/Rent
    {
      pattern: ".*",
      matchType: "regex",
      accountId: acctId("Bilt"),
      categoryId: catId("Rent"),
      priority: 100,
    },
    // Amazon Chase → Shopping/Amazon
    {
      pattern: ".*",
      matchType: "regex",
      accountId: acctId("Amazon Chase"),
      categoryId: catId("Amazon"),
      priority: 100,
    },
    // Groceries
    {
      pattern: "WHOLEFDS|TRADER JOE|INSTACART|WHOLE FOODS",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Groceries"),
      priority: 80,
    },
    // Rideshare (Uber not Eats, Lyft)
    {
      pattern: "\\bLYFT\\b",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Rideshare"),
      priority: 80,
    },
    {
      pattern: "\\bUBER\\b(?!.*EATS)",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Rideshare"),
      priority: 79,
    },
    // Food delivery
    {
      pattern: "UBER EATS|DOORDASH|GRUBHUB",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Dining"),
      priority: 80,
    },
    // Coffee
    {
      pattern: "STARBUCKS|BLUE BOTTLE",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Coffee"),
      priority: 80,
    },
    // Subscriptions
    {
      pattern: "NETFLIX|SPOTIFY|HULU|ICLOUD|APPLE.COM/BILL",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Subscriptions"),
      priority: 70,
    },
    // Income — salary
    {
      pattern: "PAYROLL|DIRECT DEPOSIT",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Salary"),
      priority: 70,
    },
    // Income — stock plan
    {
      pattern: "ETRADE|MORGAN STANLEY",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Stock plan"),
      priority: 70,
    },
    // Loan remittance (large outflows via wire services)
    {
      pattern: "ZELLE|WISE|REMITLY",
      matchType: "regex",
      accountId: null,
      categoryId: catId("Loan remittance"),
      priority: 90,
    },
  ]).run();

  console.log("✓ Seeded category rules");
}

console.log("Seed complete.");
sqlite.close();
