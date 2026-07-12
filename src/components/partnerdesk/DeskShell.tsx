"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { DeskIcon, type DeskIconName } from "@/components/partnerdesk/DeskIcon";

interface NavItem {
  label: string;
  href: string;
  icon: DeskIconName;
  disabled?: boolean;
  hint?: string;
}

const DESK_ITEMS: NavItem[] = [
  { label: "Vandaag", href: "/admin", icon: "today", disabled: true, hint: "plak 4" },
  { label: "Partners", href: "/admin/partners", icon: "partners" },
  { label: "Taken", href: "/admin/taken", icon: "tasks" },
  { label: "Instellingen", href: "/admin/instellingen", icon: "settings" },
];

const SITE_ITEMS: NavItem[] = [
  { label: "Intake-dashboard", href: "/admin/site", icon: "site" },
  { label: "Affiliate-kliks", href: "/admin/affiliate", icon: "affiliate" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/partners") return pathname.startsWith("/admin/partners");
  return pathname === href;
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const base =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
  if (item.disabled) {
    return (
      <span
        className={`${base} cursor-default text-[var(--ps-muted)]`}
        title={item.hint ? `Binnenkort (${item.hint})` : "Binnenkort"}
      >
        <DeskIcon name={item.icon} className="shrink-0" />
        {!collapsed && (
          <span className="flex-1">
            {item.label}
            <span className="ml-1 text-xs">· binnenkort</span>
          </span>
        )}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      className={`${base} ${
        active
          ? "bg-[var(--ps-green-light)] font-semibold text-[var(--ps-ink)]"
          : "text-[var(--ps-body)] hover:bg-[var(--ps-bg)] hover:text-[var(--ps-ink)]"
      }`}
      title={collapsed ? item.label : undefined}
    >
      <DeskIcon name={item.icon} className="shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
    </Link>
  );
}

export function DeskShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--ps-bg)] text-[var(--ps-ink)]">
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-[var(--ps-border)] bg-[var(--ps-surface)] transition-[width] ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-4">
          {!collapsed && (
            <span
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-dm-serif), serif" }}
            >
              PartnerDesk
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-md p-1.5 text-[var(--ps-body)] hover:bg-[var(--ps-bg)]"
            aria-label={collapsed ? "Zijbalk uitklappen" : "Zijbalk inklappen"}
          >
            <DeskIcon
              name="chevron"
              className={collapsed ? "" : "rotate-180"}
            />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2">
          {DESK_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              collapsed={collapsed}
            />
          ))}

          <div className="my-3 border-t border-[var(--ps-border)]" />
          {!collapsed && (
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ps-muted)]">
              Site
            </p>
          )}
          {SITE_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="border-t border-[var(--ps-border)] p-2">
          <a
            href="/api/admin/auth"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-bg)] hover:text-[var(--ps-ink)]"
            title={collapsed ? "Uitloggen" : undefined}
          >
            <DeskIcon name="logout" className="shrink-0" />
            {!collapsed && <span>Uitloggen</span>}
          </a>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
