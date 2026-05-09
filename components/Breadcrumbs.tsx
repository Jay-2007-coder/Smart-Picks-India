import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const all = [{ label: "Home", href: "/" }, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://smart-picks-india.vercel.app${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
          {all.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              {i === 0 && <Home className="h-3.5 w-3.5" />}
              {i < all.length - 1 ? (
                <>
                  <Link href={item.href!} className="hover:text-brand-600 transition-colors">
                    {item.label}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
