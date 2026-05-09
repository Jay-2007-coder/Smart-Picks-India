import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

export default function RelatedProducts({ products, currentSlug }: { products: Product[]; currentSlug: string }) {
  const related = products.filter((p) => p.slug !== currentSlug).slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-6">Related Products You Might Like</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
