"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, FileText, Users, MessageSquare, Settings } from "lucide-react";
import styles from "./layout.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

const groups: NavGroup[] = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/inventory", label: "Inventory", icon: Package },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/invoices", label: "Invoices", icon: FileText },
      { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
    ],
  },
  { label: "Account", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];

export default function AdminNav() {
  const pathname = usePathname();

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
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
