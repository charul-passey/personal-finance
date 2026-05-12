import { db } from "@/lib/db";

export default async function AccountsPage() {
  const allAccounts = await db.query.accounts.findMany({
    orderBy: (a, { asc }) => [asc(a.id)],
  });

  const typeLabel: Record<string, string> = {
    checking: "Checking",
    credit_full: "Credit card",
    credit_balance_only: "Credit (balance only)",
    loan: "Loan",
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your linked accounts and their current status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {allAccounts.map((acct) => (
          <div
            key={acct.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium">{acct.name}</p>
                <p className="text-xs text-muted-foreground">{acct.institution}</p>
              </div>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                ···{acct.last4}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {typeLabel[acct.type] ?? acct.type}
              </span>
              <span className="text-xs text-muted-foreground">{acct.currency}</span>
            </div>

            {!acct.trackTransactions && (
              <div className="mt-3 pt-3 border-t border-border">
                <button className="text-xs text-primary hover:underline">
                  Update statement balance →
                </button>
              </div>
            )}

            {acct.trackTransactions && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Balance computed from transactions — Phase 5
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
