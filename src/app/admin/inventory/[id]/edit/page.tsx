import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { updateProduct } from "@/app/actions/inventory";
import pageStyles from "../../../page.module.css";
import formStyles from "../../new/page.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  if (!isAdmin()) return null;

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div>
      <div className={formStyles.toolbar}>
        <Link href={`/admin/inventory/${product.id}`} className={formStyles.back}>
          ← Back to product
        </Link>
      </div>

      <h1 className={pageStyles.title}>Edit product</h1>

      <form
        className={formStyles.form}
        action={updateProduct.bind(null, product.id)}
        encType="multipart/form-data"
      >
        <div className={pageStyles.section}>
          <label className={formStyles.field}>
            SKU *
            <input name="sku" required maxLength={40} defaultValue={product.sku} />
          </label>
          <label className={formStyles.field}>
            Name *
            <input name="name" required maxLength={120} defaultValue={product.name} />
          </label>
          <label className={formStyles.field}>
            Type *
            <select name="type" required defaultValue={product.type}>
              <option value="STILL">Still</option>
              <option value="SPARKLING">Sparkling</option>
            </select>
          </label>
          <label className={formStyles.field}>
            Flavor
            <input
              name="flavor"
              maxLength={60}
              defaultValue={product.flavor ?? ""}
              placeholder="Sparkling only, e.g. Mojito"
            />
          </label>
          <label className={formStyles.field}>
            Size (ml) *
            <input name="sizeMl" type="number" min="1" required defaultValue={product.sizeMl} />
          </label>
          <label className={formStyles.field}>
            Pack count
            <input name="packCount" type="number" min="1" defaultValue={product.packCount} />
          </label>
          <label className={formStyles.field}>
            Retail price (MUR) *
            <input
              name="retailPrice"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={product.retailPrice.toString()}
            />
          </label>
          <label className={formStyles.field}>
            Wholesale price (MUR)
            <input
              name="wholesalePrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Falls back to retail"
              defaultValue={product.wholesalePrice ? product.wholesalePrice.toString() : ""}
            />
          </label>
          <label className={formStyles.field}>
            Low stock threshold
            <input name="lowStockThreshold" type="number" min="0" defaultValue={product.lowStockThreshold} />
          </label>

          <div className={styles.photoField}>
            <span className={formStyles.field}>Primary photo</span>
            {product.imageUrl && (
              <div className={styles.currentPhoto}>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={90}
                  height={90}
                  className={styles.thumb}
                />
                <label className={styles.removeLabel}>
                  <input type="checkbox" name="removeImage" /> Remove current photo
                </label>
              </div>
            )}
            <label className={formStyles.field}>
              {product.imageUrl ? "Replace with" : "Upload"}
              <input name="image" type="file" accept="image/*" />
            </label>
          </div>

          <div className={styles.photoField}>
            <span className={formStyles.field}>Second photo (optional)</span>
            {product.imageUrl2 && (
              <div className={styles.currentPhoto}>
                <Image
                  src={product.imageUrl2}
                  alt={`${product.name} second view`}
                  width={90}
                  height={90}
                  className={styles.thumb}
                />
                <label className={styles.removeLabel}>
                  <input type="checkbox" name="removeImage2" /> Remove current photo
                </label>
              </div>
            )}
            <label className={formStyles.field}>
              {product.imageUrl2 ? "Replace with" : "Upload"}
              <input name="image2" type="file" accept="image/*" />
            </label>
          </div>

          {searchParams.error && <p className={formStyles.error}>{searchParams.error}</p>}

          <button type="submit" className={formStyles.submit}>
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
