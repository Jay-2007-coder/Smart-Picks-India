import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ChevronRight } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { generateMetadata as generateSEOMetadata, generateArticleSchema, generateFAQSchema } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQAccordion from "@/components/FAQAccordion";
import PinterestShareButton from "@/components/PinterestShareButton";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt,
    image: post.image,
    type: "article",
    canonical: `https://smartpicksindia.com/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    url: `https://smartpicksindia.com/blog/${post.slug}`,
  });

  const faqSchema = generateFAQSchema(post.faqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="container-custom py-8 max-w-4xl">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

        {/* Header */}
        <header className="mt-8 mb-10 text-center">
          <Link href={`/category/${post.category}`} className="inline-block badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 mb-4 px-3 py-1 uppercase tracking-wider">
            {post.category}
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Updated {formatDate(post.dateModified)}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readTime}</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[21/9] sm:aspect-[2/1] rounded-2xl overflow-hidden mb-10 border border-border shadow-sm">
          <Image src={post.image} alt={post.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 1024px" />
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          {/* Main Content */}
          <article className="prose prose-brand dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-img:rounded-xl">
            <AffiliateDisclosure compact />
            
            <p className="text-lg text-muted-foreground leading-relaxed mt-6 mb-8">
              {post.excerpt}
            </p>

            <div className="my-8 flex justify-center">
               <PinterestShareButton url={`https://smartpicksindia.com/blog/${post.slug}`} image={post.image} description={post.excerpt} />
            </div>

            {/* Markdown content rendered (simulated rendering for now) */}
            <div className="space-y-6 text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>').replace(/## (.*?)</g, '<h2>$1<') }} />
            
            <hr className="my-10 border-border" />
            
            {/* FAQs */}
            <div className="not-prose mt-10">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <FAQAccordion faqs={post.faqs} />
            </div>

            {/* Tags */}
            <div className="mt-10 flex flex-wrap gap-2 not-prose">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 text-sm bg-muted text-muted-foreground rounded-full px-3 py-1">
                  <Tag className="h-3.5 w-3.5" />
                  {tag}
                </span>
              ))}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-8 sticky top-24 self-start">
            {/* Table of Contents */}
            <div className="card p-5">
              <h3 className="font-bold text-foreground mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {post.toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                    <ChevronRight className="h-3 w-3" />
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
            
            {/* Newsletter CTA */}
            <div className="card p-5 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950 dark:to-card border-brand-200 dark:border-brand-800">
              <h3 className="font-bold text-foreground mb-2">Get Deal Alerts</h3>
              <p className="text-sm text-muted-foreground mb-4">Join 50K+ subscribers getting our weekly top Amazon picks.</p>
              <Link href="/deals" className="btn-primary w-full py-2">View Today&apos;s Deals</Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
