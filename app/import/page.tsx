import { db } from "@/lib/db";
import { imports, accounts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ImportDropzone } from "@/components/import/dropzone";

async function getImportHistory() {
  return db
    .select({
      id: imports.id,
      filename: imports.sourceFilename,
      importedAt: imports.importedAt,
      rowsNew: imports.rowsNew,
      rowsDuplicate: imports.rowsDuplicate,
      accountName: accounts.name,
    })
    .from(imports)
    .leftJoin(accounts, eq(imports.accountId, accounts.id))
    .orderBy(desc(imports.importedAt))
    .limit(50)
    .all();
}

async function getAccountOptions() {
  return db
    .select({
      id: accounts.id,
      name: accounts.name,
      institution: accounts.institution,
    })
    .from(accounts)
    .where(eq(accounts.trackTransactions, true))
    .all();
}

export default async function ImportPage() {
  const [history, accountOptions] = await Promise.all([
    getImportHistory(),
    getAccountOptions(),
  ]);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Import</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Drop your weekly CSVs. BofA, Amex, Capital One, Chase, and Splitwise
          are auto-detected.
        </p>
      </div>

      <div className="mb-8">
        <ImportDropzone accountOptions={accountOptions} />
      </div>

      {/* Import history */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-medium">Import history</p>
        </div>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-10">
            No imports yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  File
                </th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Account
                </th>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Imported
                </th>
                <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  New
                </th>
                <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Dups
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr
                  key={row.id}
                  className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}
                >
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {row.filename}
                  </td>
                  <td className="px-5 py-3">{row.accountName ?? "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {new Date(row.importedAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-primary">
                    {row.rowsNew}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {row.rowsDuplicate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
