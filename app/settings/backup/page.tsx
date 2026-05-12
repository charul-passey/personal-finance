export default function BackupPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Backup</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Download a full copy of your pace.db SQLite file.
      </p>
      <div className="rounded-xl border border-border bg-card p-6 max-w-sm">
        <p className="text-sm text-muted-foreground mb-4">
          The file contains all your accounts, transactions, categories, and rules.
          Back it up to iCloud, Dropbox, or Git.
        </p>
        <button
          disabled
          className="w-full text-sm bg-primary text-primary-foreground rounded-md px-4 py-2 opacity-50 cursor-not-allowed"
        >
          Download pace.db — Phase 6
        </button>
      </div>
    </div>
  );
}
