import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

export default function RelatedProducts({ products, currentSlug, category }: { products: Product[]; currentSlug: string; category?: string }) {
  const related = products
    .filter((p) => p.slug !== currentSlug && (!category || p.category.toLowerCase() === category.toLowerCase()))
    .slice(0, 4);
  
  // If no related products in same category, show any other products
  const finalRelated = related.length > 0 
    ? related 
    : products.filter((p) => p.slug !== currentSlug).slice(0, 4);

  if (finalRelated.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-6">Related Products You Might Like</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {finalRelated.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
