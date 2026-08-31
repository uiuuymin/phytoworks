import type { Metadata } from "next";

import { ProductGrid } from "@/components/commerce/ProductGrid";
import { Button } from "@/components/ui/Button";
import { products } from "@/data/products";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Search | PhytoWorks Shop",
  description: "Search PhytoWorks research products.",
};

type SearchPageProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.query) ? params.query[0] : params.query;
  const query = rawQuery?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase();
  const results = normalizedQuery
    ? products.filter((product) =>
        [product.name, product.category, product.description]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : products;

  return (
    <main
      id="main-content"
      className={`container ${styles.main}`}
      tabIndex={-1}
    >
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Search</p>
        <h1>Find a research product.</h1>
        <form className={styles.form} action="/search" method="get">
          <label htmlFor="product-search">Search products</label>
          <div className={styles.formRow}>
            <input
              id="product-search"
              name="query"
              type="search"
              defaultValue={query}
              placeholder="Search by product or module"
            />
            <Button type="submit">Search</Button>
          </div>
        </form>
      </header>

      <section className={styles.results} aria-labelledby="results-heading">
        <div className={styles.resultsHeader}>
          <h2 id="results-heading">
            {query ? `Results for “${query}”` : "All products"}
          </h2>
          <p>{results.length} products</p>
        </div>
        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <p className={styles.empty}>No products found.</p>
        )}
      </section>
    </main>
  );
}
