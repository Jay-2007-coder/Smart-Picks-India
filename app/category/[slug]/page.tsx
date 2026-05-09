import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};

  return generateSEOMetadata({
    title: `Best ${category.name} in India`,
    description: `Shop the best budget ${category.name.toLowerCase()} in India. Expert reviews and latest Amazon deals on ${category.description.toLowerCase()}.`,
    image: category.image,
    canonical: `https://smart-picks-india.vercel.app/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter((p) => p.category === slug);

  return (
    <div className="container-custom py-8">
      <Breadcrumbs items={[{ label: category.name }]} />

      <div className="mt-8 mb-12 text-center max-w-2xl mx-auto">
        <span className="text-4xl mb-4 block">{category.icon}</span>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
          {category.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          {category.description}
        </p>
      </div>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border">
          <p className="text-muted-foreground">No products found in this category yet.</p>
        </div>
      )}
    </div>
  );
}
