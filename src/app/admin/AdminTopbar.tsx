import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { searchAdmin } from "@/app/actions/admin-search";
import styles from "./layout.module.css";

export default function AdminTopbar({ alertCount }: { alertCount: number }) {
  return (
    <header className={styles.topbar}>
      <form action={searchAdmin} className={styles.searchForm}>
        <Search size={16} className={styles.searchIcon} aria-hidden />
        <input
          type="text"
          name="q"
          placeholder="Jump to order # or search customers…"
          className={styles.searchInput}
        />
      </form>
      <Link href="/admin" className={styles.bellLink} aria-label={`${alertCount} open alerts`}>
        <Bell size={18} />
        {alertCount > 0 && <span className={styles.bellBadge}>{alertCount}</span>}
      </Link>
    </header>
  );
}
