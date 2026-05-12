export default function SplitsPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Splits</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Shared expenses with Divya.
          </p>
        </div>
        <button className="text-sm text-primary border border-primary/40 rounded-md px-4 py-1.5 hover:bg-primary/10 transition-colors">
          Log settlement
        </button>
      </div>

      {/* Receivable banner */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Receivable from Divya</p>
          <p className="text-xs text-muted-foreground mt-0.5">Last settled: —</p>
        </div>
        <span className="text-2xl font-semibold text-primary">$—</span>
      </div>

      {/* Tabs placeholder */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border flex">
          <button className="px-6 py-3 text-sm font-medium text-primary border-b-2 border-primary">
            Needs review
          </button>
          <button className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            All splits
          </button>
        </div>
        <div className="p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Splits table — Phase 3</p>
        </div>
      </div>
    </div>
  );
}
