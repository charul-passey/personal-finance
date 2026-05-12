import { db } from "@/lib/db";
import { transactions, accounts, categories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { cn } from "@/lib/utils";

async function getTransactions() {
  return db
    .select({
      id: transactions.id,
      date: transactions.date,
      description: transactions.description,
      amount: transactions.amount,
      isTransfer: transactions.isTransfer,
      accountName: accounts.name,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(200)
    .all();
}

function fmtCents(cents: number): string {
  const abs = Math.abs(cents) / 100;
  const fmt = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-$${fmt}` : `+$${fmt}`;
}

export default async function TransactionsPage() {
  const rows = await getTransactions();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {rows.length === 0
              ? "No transactions yet — import some CSVs to get started."
              : `${rows.length} most recent transactions. Filters and actions coming in Phase 3.`}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-16 flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground text-sm">
            No transactions yet.
          </p>
          <a
            href="/import"
            className="text-sm text-primary border border-primary/40 rounded-md px-4 py-1.5 hover:bg-primary/10 transition-colors"
          >
            Go to Import →
          </a>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Account
                </th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/40 last:border-0",
                    i % 2 === 0 ? "" : "bg-muted/10"
                  )}
                >
                  <td className="px-5 py-3 tabular-nums text-muted-foreground whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {row.accountName}
                  </td>
                  <td
                    className="px-5 py-3 max-w-[300px] truncate"
                    title={row.description}
                  >
                    {row.description}
                    {row.isTransfer && (
                      <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        transfer
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {row.categoryName ? (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {row.categoryName}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right tabular-nums font-medium whitespace-nowrap",
                      row.amount < 0 ? "text-foreground" : "text-green-400"
                    )}
                  >
                    {fmtCents(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
