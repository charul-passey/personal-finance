export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Hey Charul</h1>
        <p className="text-muted-foreground mt-1">Your weekly finance snapshot.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending tile */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Spending tile — Phase 4</p>
        </div>

        {/* Cumulative chart */}
        <div className="rounded-xl border border-border bg-card p-6 min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Cumulative chart — Phase 4</p>
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-border bg-card p-6 min-h-[180px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Top categories — Phase 4</p>
        </div>

        {/* Credit cards vs paycheck */}
        <div className="rounded-xl border border-border bg-card p-6 min-h-[180px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Credit cards vs paycheck — Phase 4</p>
        </div>

        {/* Heatmap */}
        <div className="rounded-xl border border-border bg-card p-6 min-h-[180px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Day-by-day heatmap — Phase 4</p>
        </div>

        {/* Splits */}
        <div className="rounded-xl border border-border bg-card p-6 min-h-[160px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">With Divya — Phase 4</p>
        </div>

        {/* Loan */}
        <div className="rounded-xl border border-border bg-card p-6 min-h-[160px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loan tile — Phase 5</p>
        </div>

        {/* My spending */}
        <div className="rounded-xl border border-border bg-card p-6 min-h-[160px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">My spending — Phase 4</p>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 min-h-[160px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Recent activity — Phase 4</p>
        </div>
      </div>
    </div>
  );
}
