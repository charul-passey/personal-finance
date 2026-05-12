"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileSession, AccountOption, PreviewRow } from "@/lib/csv/types";

type Status = "idle" | "loading" | "preview" | "committing" | "done" | "error";

interface CommitResult {
  filename: string;
  inserted: number;
  skipped: number;
  type: "transactions" | "splitwise";
}

interface Props {
  accountOptions: AccountOption[];
  onImportDone?: () => void;
}

export function ImportDropzone({ accountOptions, onImportDone }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [dragging, setDragging] = useState(false);
  const [sessions, setSessions] = useState<FileSession[]>([]);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<CommitResult[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Pending category edits keyed by hash
  const [categoryEdits, setCategoryEdits] = useState<
    Record<string, { categoryId: number | null; categoryName: string | null }>
  >({});

  const runPreview = useCallback(
    async (files: File[], currentOverrides: Record<string, number>) => {
      setStatus("loading");
      setError("");
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      if (Object.keys(currentOverrides).length > 0) {
        fd.append("overrides", JSON.stringify(currentOverrides));
      }
      try {
        const res = await fetch("/api/import/preview", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSessions(data.sessions);
        setStatus("preview");
        setCategoryEdits({});
      } catch (e) {
        setError(String(e));
        setStatus("error");
      }
    },
    []
  );

  const filesRef = useRef<File[]>([]);

  const handleFiles = (files: File[]) => {
    filesRef.current = files;
    runPreview(files, overrides);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.endsWith(".csv")
    );
    if (files.length) handleFiles(files);
  };

  const handleAccountOverride = (filename: string, accountId: number) => {
    const next = { ...overrides, [filename]: accountId };
    setOverrides(next);
    runPreview(filesRef.current, next);
  };

  const newRowsCount = sessions.reduce((n, s) => n + s.newRows.length + (s.splitwiseRows?.length ?? 0), 0);

  const handleCommit = async () => {
    setStatus("committing");

    const transactionSessions = sessions
      .filter((s) => !s.isBiltSkip && !s.ambiguous && s.source !== "splitwise")
      .map((s) => ({
        accountId: s.accountId!,
        filename: s.filename,
        rows: s.newRows.map((r) => ({
          ...r,
          ...(categoryEdits[r.hash] ?? {}),
        })),
      }));

    const splitwiseSessions = sessions
      .filter((s) => s.source === "splitwise")
      .map((s) => ({
        filename: s.filename,
        rows: s.splitwiseRows ?? [],
      }));

    try {
      const res = await fetch("/api/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionSessions, splitwiseSessions }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.results);
      setStatus("done");
      onImportDone?.();
    } catch (e) {
      setError(String(e));
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setSessions([]);
    setOverrides({});
    setExpanded({});
    setResults([]);
    setError("");
    filesRef.current = [];
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (status === "done") {
    const totalInserted = results.reduce((n, r) => n + r.inserted, 0);
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-lg font-semibold mb-1">Import complete</p>
        <p className="text-muted-foreground text-sm mb-4">
          {totalInserted} row{totalInserted !== 1 ? "s" : ""} imported
        </p>
        {results.map((r) => (
          <p key={r.filename} className="text-xs text-muted-foreground">
            {r.filename}: {r.inserted} new, {r.skipped} skipped
          </p>
        ))}
        <button
          onClick={reset}
          className="mt-5 text-sm text-primary border border-primary/40 rounded-md px-4 py-1.5 hover:bg-primary/10 transition-colors"
        >
          Import more files
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-xl border border-destructive/40 bg-card p-8 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="font-semibold mb-1">Something went wrong</p>
        <p className="text-xs text-muted-foreground mb-4 font-mono">{error}</p>
        <button onClick={reset} className="text-sm text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (status === "preview") {
    return (
      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.filename}
            session={session}
            expanded={!!expanded[session.filename]}
            onToggle={() =>
              setExpanded((e) => ({
                ...e,
                [session.filename]: !e[session.filename],
              }))
            }
            accountOptions={accountOptions}
            onAccountOverride={(id) =>
              handleAccountOverride(session.filename, id)
            }
            categoryEdits={categoryEdits}
            onCategoryEdit={(hash, id, name) =>
              setCategoryEdits((e) => ({ ...e, [hash]: { categoryId: id, categoryName: name } }))
            }
          />
        ))}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={reset}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleCommit}
            disabled={newRowsCount === 0}
            className={cn(
              "text-sm font-medium rounded-md px-5 py-2 transition-colors",
              newRowsCount > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Import {newRowsCount} row{newRowsCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    );
  }

  // idle / loading
  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "rounded-xl border-2 border-dashed p-12 flex flex-col items-center gap-3 text-center cursor-pointer transition-colors",
          dragging
            ? "border-primary bg-primary/10"
            : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) handleFiles(files);
          }}
        />
        {status === "loading" ? (
          <>
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium">Analysing files…</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium text-sm">Drop CSV files here or click to select</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              BofA, Amex, Capital One, Chase, and Splitwise exports are
              auto-detected. Drop multiple files at once.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Session card ─────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: FileSession;
  expanded: boolean;
  onToggle: () => void;
  accountOptions: AccountOption[];
  onAccountOverride: (accountId: number) => void;
  categoryEdits: Record<string, { categoryId: number | null; categoryName: string | null }>;
  onCategoryEdit: (hash: string, id: number | null, name: string | null) => void;
}

function SessionCard({
  session,
  expanded,
  onToggle,
  accountOptions,
  onAccountOverride,
  categoryEdits,
  onCategoryEdit,
}: SessionCardProps) {
  const isSplitwise = session.source === "splitwise";
  const rowCount = isSplitwise
    ? (session.splitwiseRows?.length ?? 0)
    : session.newRows.length;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-sm">{session.filename}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {session.isBiltSkip
                ? "Balance-only account — skipped"
                : session.ambiguous
                ? "Source not detected — pick an account"
                : isSplitwise
                ? `Splitwise — ${rowCount} expense${rowCount !== 1 ? "s" : ""}`
                : `${session.accountName} — ${rowCount} new, ${session.duplicateCount} already imported`}
            </p>
          </div>
        </div>
        {!session.isBiltSkip && (
          expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )
        )}
      </div>

      {/* Bilt tip */}
      {session.isBiltSkip && (
        <div className="px-5 pb-4 text-xs text-muted-foreground border-t border-border pt-3">
          Bilt is balance-only. Go to{" "}
          <a href="/accounts" className="text-primary hover:underline">
            Accounts
          </a>{" "}
          to log this month's statement balance instead.
        </div>
      )}

      {/* Ambiguous: pick account */}
      {session.ambiguous && expanded && (
        <div className="px-5 pb-4 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-2">
            Which account is this file from?
          </p>
          <div className="flex flex-wrap gap-2">
            {accountOptions.map((a) => (
              <button
                key={a.id}
                onClick={(e) => { e.stopPropagation(); onAccountOverride(a.id); }}
                className="text-xs border border-border rounded-md px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Splitwise rows */}
      {isSplitwise && expanded && (session.splitwiseRows?.length ?? 0) > 0 && (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                <th className="text-right px-4 py-2 text-muted-foreground font-medium">My share</th>
                <th className="text-right px-4 py-2 text-muted-foreground font-medium">Divya owes</th>
              </tr>
            </thead>
            <tbody>
              {session.splitwiseRows!.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "" : "bg-muted/10"}>
                  <td className="px-4 py-2 tabular-nums text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-2">{r.description}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{fmtCents(r.amountPaidByMe)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{fmtCents(r.amountOwedByPartner)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction rows */}
      {!isSplitwise && !session.ambiguous && !session.isBiltSkip && expanded && session.newRows.length > 0 && (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-medium">Category</th>
                <th className="text-right px-4 py-2 text-muted-foreground font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {session.newRows.map((row, i) => {
                const edit = categoryEdits[row.hash];
                const catName = edit ? edit.categoryName : row.categoryName;
                return (
                  <tr key={row.hash} className={i % 2 === 0 ? "" : "bg-muted/10"}>
                    <td className="px-4 py-2 tabular-nums text-muted-foreground whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-4 py-2 max-w-[260px] truncate" title={row.description}>
                      {row.description}
                    </td>
                    <td className="px-4 py-2">
                      <CategoryPill
                        value={catName}
                        onChange={(id, name) => onCategoryEdit(row.hash, id, name)}
                      />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 text-right tabular-nums font-medium whitespace-nowrap",
                        row.amount < 0 ? "text-foreground" : "text-green-400"
                      )}
                    >
                      {fmtCents(row.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No new rows */}
      {!isSplitwise && !session.ambiguous && !session.isBiltSkip && expanded && session.newRows.length === 0 && (
        <div className="px-5 py-4 border-t border-border text-xs text-muted-foreground">
          All {session.duplicateCount} rows already imported.
        </div>
      )}
    </div>
  );
}

// Lightweight category pill — just shows the label for now; clicking it is a stub
function CategoryPill({
  value,
  onChange: _onChange,
}: {
  value: string | null;
  onChange: (id: number | null, name: string | null) => void;
}) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded text-xs",
        value
          ? "bg-primary/20 text-primary"
          : "bg-muted text-muted-foreground"
      )}
    >
      {value ?? "Uncategorized"}
    </span>
  );
}

function fmtCents(cents: number): string {
  const abs = Math.abs(cents) / 100;
  const fmt = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return cents < 0 ? `-$${fmt}` : `$${fmt}`;
}
