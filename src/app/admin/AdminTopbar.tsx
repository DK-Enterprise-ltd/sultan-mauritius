import { Search } from "lucide-react";
import { searchAdmin } from "@/app/actions/admin-search";
import styles from "./layout.module.css";

export default function AdminTopbar() {
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
    </header>
  );
}
