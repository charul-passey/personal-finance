import Link from "next/link";

const sections = [
  {
    href: "/settings/accounts",
    title: "Accounts",
    description: "Add, edit, or remove accounts.",
  },
  {
    href: "/settings/categories",
    title: "Categories",
    description: "Manage your category tree and set monthly budgets.",
  },
  {
    href: "/settings/rules",
    title: "Categorization rules",
    description: "Reorder, edit, or delete auto-categorization rules.",
  },
  {
    href: "/settings/backup",
    title: "Backup",
    description: "Download a copy of pace.db.",
  },
];

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure accounts, categories, rules, and backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-accent/40 transition-colors group"
          >
            <p className="font-medium group-hover:text-primary transition-colors">
              {s.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
