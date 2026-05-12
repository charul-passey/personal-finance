import { db } from "@/lib/db";
import { categoryRules, categories, accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function RulesPage() {
  const rules = await db
    .select({
      id: categoryRules.id,
      pattern: categoryRules.pattern,
      matchType: categoryRules.matchType,
      priority: categoryRules.priority,
      categoryName: categories.name,
      accountName: accounts.name,
    })
    .from(categoryRules)
    .leftJoin(categories, eq(categoryRules.categoryId, categories.id))
    .leftJoin(accounts, eq(categoryRules.accountId, accounts.id))
    .orderBy(categoryRules.priority);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Categorization rules
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Applied in priority order during import. Higher priority runs first.
          </p>
        </div>
        <button className="text-sm text-primary border border-primary/40 rounded-md px-4 py-1.5 hover:bg-primary/10 transition-colors">
          Add rule
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {rules.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No rules yet. Run the seed script to load defaults.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Pattern
                </th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Account
                </th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, i) => (
                <tr
                  key={rule.id}
                  className={
                    i % 2 === 0 ? "bg-card" : "bg-muted/30"
                  }
                >
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {rule.priority}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{rule.pattern}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rule.matchType}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {rule.accountName ?? "All accounts"}
                  </td>
                  <td className="px-4 py-3 text-primary font-medium">
                    {rule.categoryName}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-muted-foreground hover:text-foreground">
                      Edit
                    </button>
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
