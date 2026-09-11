"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, FileText, Users } from "lucide-react";
import styles from "./layout.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminNav({ pendingOrders, lowStockCount }: { pendingOrders: number; lowStockCount: number }) {
  const pathname = usePathname();

  const groups: NavGroup[] = [
    { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
    {
      label: "Commerce",
      items: [
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: pendingOrders || undefined },
        { href: "/admin/inventory", label: "Inventory", icon: Package, badge: lowStockCount || undefined },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/invoices", label: "Invoices", icon: FileText },
      ],
    },
  ];

  return (
    <nav className={styles.nav}>
      {groups.map((group) => (
        <div key={group.label} className={styles.navGroup}>
          <span className={styles.navGroupLabel}>{group.label}</span>
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={17} className={styles.navIcon} aria-hidden />
                <span className={styles.navLabel}>{item.label}</span>
                {!!item.badge && <span className={styles.navBadge}>{item.badge}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
