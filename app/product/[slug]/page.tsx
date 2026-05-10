import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, X, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { products } from "@/data/products";
import { generateMetadata as generateSEOMetadata, generateProductSchema, generateFAQSchema } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import RatingStars from "@/components/RatingStars";
import CTASection from "@/components/CTASection";
import RelatedProducts from "@/components/RelatedProducts";
import PinterestShareButton from "@/components/PinterestShareButton";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};

  return generateSEOMetadata({
    title: product.title,
    description: product.description,
    image: product.image,
    type: "website",
    canonical: `https://smart-picks-india.vercel.app/product/${product.slug}`,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const productSchema = generateProductSchema({
    name: product.title,
    description: product.description,
    image: product.image,
    price: product.price,
    rating: product.rating,
    reviewCount: product.reviewCount,
    url: `https://smart-picks-india.vercel.app/product/${product.slug}`,
  });

  const faqs = [
    { question: `Is ${product.title} worth buying?`, answer: `Yes, considering its features like ${product.features[0].toLowerCase()} and ${product.features[1].toLowerCase()}, it offers great value for money in its category.` },
    { question: `Where can I get the best deal on ${product.title}?`, answer: `The best deals are usually found on Amazon India during sales or lightning deals. Check the current price using our link.` },
    { question: `What is the warranty period?`, answer: `Please check the Amazon product page for the exact manufacturer warranty details.` },
  ];
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="container-custom py-8">
        <Breadcrumbs items={[{ label: product.category, href: `/category/${product.category}` }, { label: product.title }]} />

        <div className="mt-8 grid lg:grid-cols-2 gap-12">
          {/* Image Gallery (Simplified for now) */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
              <Image src={product.image} alt={product.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/50 border border-border text-center">
                <Truck className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-xs font-medium">Free Delivery*</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/50 border border-border text-center">
                <RotateCcw className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-xs font-medium">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/50 border border-border text-center">
                <ShieldCheck className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-xs font-medium">Secure Pay</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Link href={`/category/${product.category}`} className="text-sm font-semibold text-brand-600 uppercase tracking-wide">
                {product.category}
              </Link>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-2 mb-4 leading-tight">
                {product.title}
              </h1>
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="lg" />
            </div>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            <CTASection affiliateLink={product.affiliateLink} title={product.title} price={product.price} oldPrice={product.oldPrice} />

            <div className="mt-6 flex flex-wrap gap-3">
              <PinterestShareButton url={`https://smart-picks-india.vercel.app/product/${product.slug}`} image={product.image} description={product.description} />
            </div>

            {/* Pros & Cons */}
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10 p-5">
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                  <Check className="h-5 w-5" /> Pros
                </h3>
                <ul className="space-y-2">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                      <span className="mt-1 text-green-500">•</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10 p-5">
                <h3 className="font-semibold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
                  <X className="h-5 w-5" /> Cons
                </h3>
                <ul className="space-y-2">
                  {product.cons.map((con, i) => (
                    <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                      <span className="mt-1 text-red-500">•</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key Features */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Key Features</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground bg-muted/50 rounded-lg px-4 py-2 text-sm">
                    <Check className="h-4 w-4 text-brand-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-10">
               <AffiliateDisclosure />
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts products={products} currentSlug={product.slug} category={product.category} />
        </div>
      </div>
    </>
  );
}
