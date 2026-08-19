import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import ProductCard from "@/components/ProductCard/ProductCard";
import Button from "@/components/Button/Button";
import styles from "./page.module.css";

export default async function HomePage() {
  const viewer = getViewer();
  const featured = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <>
      <section className={styles.hero}>
        <p className={styles.heroKicker}>Made in Mauritius</p>
        <h1 className={styles.heroTitle}>Water, bottled bold.</h1>
        <p className={styles.heroSubtitle}>
          Sparkling flavored water in glass, and still spring water for every day —
          for your home or your restaurant.
        </p>
        <div className={styles.heroActions}>
          <Link href="/products">
            <Button variant="secondary">Shop the range</Button>
          </Link>
          <Link href="/wholesale">
            <Button variant="outline" className={styles.heroOutline}>
              Wholesale enquiries
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.intro}>
        <div className={styles.introBlock}>
          <h2>Sparkling, with real fruit flavor</h2>
          <p>
            Watermelon-strawberry and more, in returnable glass bottles — bold flavor,
            no artificial aftertaste.
          </p>
        </div>
        <div className={styles.introBlock}>
          <h2>Still, straight from the source</h2>
          <p>
            Our spring water line in lightweight plastic bottles, for everyday
            hydration at home or on the go.
          </p>
        </div>
      </section>

      <section className={styles.featured}>
        <h2 className={styles.featuredTitle}>Featured products</h2>
        <div className={styles.grid}>
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                type: product.type,
                flavor: product.flavor,
                sizeMl: product.sizeMl,
                imageUrl: product.imageUrl,
                displayPrice: resolvePrice(product, viewer),
                stockQuantity: product.stockQuantity,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
