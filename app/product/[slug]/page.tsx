import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, X, ShieldCheck, Truck, RotateCcw, Tag, Award, Sparkles, HelpCircle, ThumbsUp } from "lucide-react";
import { products } from "@/data/products";
import { generateMetadata as generateSEOMetadata, generateProductSchema, generateFAQSchema } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import RatingStars from "@/components/RatingStars";
import CTASection from "@/components/CTASection";
import RelatedProducts from "@/components/RelatedProducts";
import PinterestShareButton from "@/components/PinterestShareButton";
import WhatsAppAlertButton from "@/components/WhatsAppAlertButton";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import RecentlyViewedTracker from "@/components/RecentlyViewedTracker";
import ProductLazyWidgets from "@/components/ProductLazyWidgets";
import FAQAccordion from "@/components/FAQAccordion";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import ProductTrustBanner from "@/components/ProductTrustBanner";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.slice(0, 150).map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  let product = products.find((p) => p.slug === slug);

  if (!product) {
    try {
      const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/v1/deals/product/${slug}`, {
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          product = data.product;
        }
      }
    } catch (err) {
      console.error("Error fetching dynamic metadata from backend:", err);
    }
  }

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
  let product = products.find((p) => p.slug === slug);

  if (!product) {
    try {
      const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/v1/deals/product/${slug}`, {
        next: { revalidate: 60 }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          product = data.product;
        }
      }
    } catch (err) {
      console.error("Error fetching dynamic product page from backend:", err);
    }
  }

  if (!product) {
    notFound();
  }

  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

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
    { 
      question: `Is this product worth buying?`, 
      answer: `Yes! Based on user ratings (${product.rating}/5) and key features like ${product.features[0]?.toLowerCase() || 'premium quality'} and ${product.features[1]?.toLowerCase() || 'durable build'}, it represents an excellent value for money in the ${product.category} category.` 
    },
    { 
      question: `Where can I get the best deal & authentic stock?`, 
      answer: `The lowest verified price is updated live on Amazon India. Click 'Buy on Amazon' to access direct manufacturer listings, genuine warranty, and ongoing lightning discounts.` 
    },
    { 
      question: `How does delivery & return policy work?`, 
      answer: `Eligible items qualify for Amazon Prime Fast Free Delivery. You also enjoy Amazon's standard hassle-free return window and buyer protection guarantees.` 
    },
    { 
      question: `Why is this deal verified as a Smart Pick?`, 
      answer: `Our platform evaluates seller reputation, price history trends, authentic customer feedback, and overall value score to ensure you only get genuine, high-quality deals.` 
    }
  ];
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <RecentlyViewedTracker slug={product.slug} />

      <div className="container-custom pt-6 pb-24 space-y-12">
        <Breadcrumbs items={[{ label: product.category, href: `/category/${product.category}` }, { label: product.title }]} />

        {/* Top High-Trust Verification & Scorecard Banner */}
        <ProductTrustBanner rating={product.rating} reviewCount={product.reviewCount} />

        {/* Hero Top Grid: Balanced Left Image & Key Specs + Right Purchase Controls */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Sticky Image Gallery, Trust Badges, and Key Highlights */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Main Product Image Container */}
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-border bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 shadow-md group">
              <Image 
                src={product.image} 
                alt={product.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                priority 
                sizes="(max-width: 1024px) 100vw, 42vw" 
              />
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/80 text-center shadow-sm">
                <Truck className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-[11px] font-bold text-foreground">Free Delivery*</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/80 text-center shadow-sm">
                <RotateCcw className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-[11px] font-bold text-foreground">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/80 text-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-[11px] font-bold text-foreground">Secure Pay</span>
              </div>
            </div>

            {/* Key Features Highlights Box (Placed on Left to efficiently use column space!) */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <h3 className="font-extrabold text-foreground text-sm">Key Feature Highlights</h3>
              </div>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-semibold text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* RIGHT COLUMN: Buying CTA, Ratings, Price Tracking, and Description */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header & Titles */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/category/${product.category}`} className="text-xs font-black text-brand-600 uppercase tracking-widest bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-lg">
                  {product.category}
                </Link>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> Verified Smart Pick
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground leading-tight tracking-tight">
                {product.title}
              </h1>

              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="lg" />
            </div>

            {/* Short Product Description */}
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed border-l-2 border-brand-500/40 pl-4 py-1">
              {product.description}
            </p>

            {/* Primary Amazon CTA Box */}
            <CTASection affiliateLink={product.affiliateLink} title={product.title} price={product.price} oldPrice={product.oldPrice} />

            {/* Social Share & Quick Notification Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <PinterestShareButton url={`https://smart-picks-india.vercel.app/product/${product.slug}`} image={product.image} description={product.description} />
              <WhatsAppAlertButton slug={product.slug} title={product.title} price={product.price} oldPrice={product.oldPrice || product.price} />
            </div>

            {/* Live Price History Chart & Price Alert Tracker */}
            <div className="grid sm:grid-cols-2 gap-5 pt-2">
              <ProductLazyWidgets slug={product.slug} currentPrice={product.price} />
            </div>

          </div>

        </div>

        {/* Deep Dive Section: Pros & Cons Comparison Matrix */}
        <div className="space-y-6 pt-6 border-t border-border/80">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-extrabold text-foreground">Pros &amp; Cons Evaluation</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
              <h3 className="font-extrabold text-emerald-700 dark:text-emerald-400 text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-500" /> Pros &amp; Standout Strengths
              </h3>
              <ul className="space-y-2.5">
                {product.pros.map((pro, i) => (
                  <li key={i} className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-4">
              <h3 className="font-extrabold text-rose-700 dark:text-rose-400 text-base flex items-center gap-2">
                <X className="h-5 w-5 text-rose-500" /> Things to Keep in Mind (Cons)
              </h3>
              <ul className="space-y-2.5">
                {product.cons.map((con, i) => (
                  <li key={i} className="text-xs sm:text-sm font-semibold text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Accordion Section */}
        <div className="space-y-6 max-w-4xl pt-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <HelpCircle className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-extrabold text-foreground">Frequently Asked Questions</h2>
          </div>

          <FAQAccordion faqs={faqs} />
        </div>

        {/* Affiliate Transparency Disclosure */}
        <AffiliateDisclosure />

        {/* Related & Category Products Carousel */}
        <div className="pt-4">
          <RelatedProducts products={products} currentSlug={product.slug} category={product.category} />
        </div>

      </div>

      {/* Sticky Bottom Buy Bar on Mobile Viewports */}
      <StickyMobileCTA
        affiliateLink={product.affiliateLink}
        title={product.title}
        price={product.price}
        oldPrice={product.oldPrice}
      />
    </>
  );
}


