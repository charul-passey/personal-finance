export default function LoanPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Loan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your India loan balance and USD remittances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Current balance */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Current Balance
          </p>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-4xl font-semibold text-foreground">₹ —</span>
          </div>
          <p className="text-sm text-muted-foreground">as of —</p>
          <p className="text-sm text-muted-foreground mt-1">≈ $ — USD at — INR/USD</p>
        </div>

        {/* Update balance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Update Balance
          </p>
          <p className="text-sm text-muted-foreground">
            Balance entry form — Phase 5
          </p>
        </div>

        {/* Remittances */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Remittances table — Phase 5</p>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 min-h-[160px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Remittance chart — Phase 5</p>
        </div>
      </div>
    </div>
  );
}
