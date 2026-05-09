import Link from "next/link";
import { ShoppingBag, Camera, MessageCircle, Video } from "lucide-react";

const footerLinks = {
  "Quick Links": [
    { href: "/", label: "Home" },
    { href: "/deals", label: "Today's Deals" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
  Categories: [
    { href: "/category/tech", label: "Tech & Electronics" },
    { href: "/category/kitchen", label: "Kitchen" },
    { href: "/category/home", label: "Home & Living" },
    { href: "/category/gadgets", label: "Gadgets" },
    { href: "/category/fashion", label: "Fashion" },
    { href: "/category/study", label: "Study & Office" },
  ],
  Legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/disclaimer#affiliate", label: "Affiliate Disclosure" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-brand-600" />
              <span className="font-display font-bold text-lg">
                Smart<span className="text-brand-600">Picks</span> India
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India&apos;s trusted source for budget product reviews and Amazon deals. We help smart shoppers make better buying decisions.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-brand-50 hover:text-brand-600 transition-colors text-muted-foreground">
                <Camera className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-brand-50 hover:text-brand-600 transition-colors text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-brand-50 hover:text-brand-600 transition-colors text-muted-foreground">
                <Video className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
            <strong>Affiliate Disclosure:</strong> Smart Picks India is a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to amazon.in. As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.
          </p>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Smart Picks India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
