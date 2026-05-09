export const siteConfig = {
  name: "Smart Picks India",
  tagline: "India's Smartest Budget Picks",
  description:
    "Discover the best budget products in India. Expert reviews, deals, and recommendations on tech, kitchen, home, fashion, and gadgets for smart Indian shoppers.",
  url: "https://smart-picks-india.vercel.app",
  ogImage: "https://smart-picks-india.vercel.app/og/default.png",
  twitterHandle: "@smartpicksindia",
  amazonTag: process.env.NEXT_PUBLIC_AMAZON_TAG || "smartpicksin-21",
  keywords: [
    "best products India",
    "budget picks India",
    "Amazon India deals",
    "best budget gadgets",
    "smart shopping India",
    "top rated products India",
  ],
};

export type MetadataInput = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "product";
  canonical?: string;
};

export function generateMetadata(input: MetadataInput) {
  const title = input.title
    ? `${input.title} | Smart Picks India`
    : `${siteConfig.name} — ${siteConfig.tagline}`;
  const description = input.description || siteConfig.description;
  const image = input.image || siteConfig.ogImage;
  const canonical = input.canonical || siteConfig.url;

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...(input.keywords || [])].join(", "),
    authors: [{ name: "Smart Picks India" }],
    creator: "Smart Picks India",
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: input.type || "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [image],
      creator: siteConfig.twitterHandle,
    },
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" as const },
    },
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviewCount?: number;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Amazon India" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 100,
      bestRating: 5,
    },
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    url: article.url,
    author: { "@type": "Organization", name: "Smart Picks India" },
    publisher: {
      "@type": "Organization",
      name: "Smart Picks India",
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.png` },
    },
  };
}
