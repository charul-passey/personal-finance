"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Users,
  Upload,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts",     label: "Accounts",     icon: CreditCard },
  { href: "/loan",         label: "Loan",         icon: Landmark },
  { href: "/splits",       label: "Splits",       icon: Users },
  { href: "/import",       label: "Import",       icon: Upload },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col w-56 shrink-0 border-r border-border bg-sidebar h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <span className="text-xl font-semibold tracking-tight text-primary">
          pace
        </span>
        <span className="ml-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
          finance
        </span>
      </div>

      {/* Nav items */}
      <ul className="flex flex-col gap-0.5 p-3 flex-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">Charul Passey</p>
      </div>
    </nav>
  );
}
