import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

export default async function SettingsCategoriesPage() {
  const parents = await db
    .select()
    .from(categories)
    .where(isNull(categories.parentId));

  const allCats = await db.select().from(categories);
  const children = allCats.filter((c) => c.parentId !== null);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Categories</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Manage your category tree and set monthly budgets.
      </p>

      <div className="space-y-4 max-w-xl">
        {parents.map((parent) => (
          <div key={parent.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              {parent.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: parent.color }}
                />
              )}
              <p className="font-medium">{parent.name}</p>
            </div>
            <div className="pl-4 space-y-1">
              {children
                .filter((c) => c.parentId === parent.id)
                .map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between text-sm py-0.5"
                  >
                    <span className="text-muted-foreground">{child.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {child.monthlyBudget
                        ? `$${(child.monthlyBudget / 100).toFixed(0)}/mo`
                        : "no budget"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* Flat categories */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-medium mb-2">Standalone</p>
          <div className="space-y-1">
            {children.length === 0 &&
              allCats
                .filter((c) => c.parentId === null && !parents.find((p) => p.id === c.id))
                .map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-sm py-0.5">
                    {c.color && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: c.color }}
                      />
                    )}
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
