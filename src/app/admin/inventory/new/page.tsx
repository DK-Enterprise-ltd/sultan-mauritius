import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { createProduct } from "@/app/actions/inventory";
import pageStyles from "../../page.module.css";
import styles from "./page.module.css";

export default function NewProductPage({ searchParams }: { searchParams: { error?: string } }) {
  if (!isAdmin()) return null;

  return (
    <div>
      <div className={styles.toolbar}>
        <Link href="/admin/inventory" className={styles.back}>
          ← Back to inventory
        </Link>
      </div>

      <h1 className={pageStyles.title}>Add product</h1>

      <form className={styles.form} action={createProduct} encType="multipart/form-data">
        <div className={pageStyles.section}>
          <label className={styles.field}>
            SKU *
            <input name="sku" required maxLength={40} />
          </label>
          <label className={styles.field}>
            Name *
            <input name="name" required maxLength={120} />
          </label>
          <label className={styles.field}>
            Type *
            <select name="type" required defaultValue="">
              <option value="" disabled>
                Choose type
              </option>
              <option value="STILL">Still</option>
              <option value="SPARKLING">Sparkling</option>
            </select>
          </label>
          <label className={styles.field}>
            Flavor
            <input name="flavor" maxLength={60} placeholder="Sparkling only, e.g. Mojito" />
          </label>
          <label className={styles.field}>
            Size (ml) *
            <input name="sizeMl" type="number" min="1" required />
          </label>
          <label className={styles.field}>
            Pack count
            <input name="packCount" type="number" min="1" defaultValue={1} />
          </label>
          <label className={styles.field}>
            Retail price (MUR) *
            <input name="retailPrice" type="number" min="0" step="0.01" required />
          </label>
          <label className={styles.field}>
            Wholesale price (MUR)
            <input name="wholesalePrice" type="number" min="0" step="0.01" placeholder="Falls back to retail" />
          </label>
          <label className={styles.field}>
            Starting stock
            <input name="stockQuantity" type="number" min="0" defaultValue={0} />
          </label>
          <label className={styles.field}>
            Low stock threshold
            <input name="lowStockThreshold" type="number" min="0" defaultValue={20} />
          </label>
          <label className={styles.field}>
            Photo
            <input name="image" type="file" accept="image/*" />
          </label>

          {searchParams.error && <p className={styles.error}>{searchParams.error}</p>}

          <button type="submit" className={styles.submit}>
            Add product
          </button>
        </div>
      </form>
    </div>
  );
}
