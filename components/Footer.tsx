"use client";
import Link from "next/link";
import { ShoppingBag, Camera, MessageCircle, Video, ArrowUpRight, Heart } from "lucide-react";
import { motion } from "framer-motion";

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

const socialLinks = [
  { href: "https://instagram.com", icon: Camera, label: "Instagram" },
  { href: "https://twitter.com", icon: MessageCircle, label: "Twitter" },
  { href: "https://youtube.com", icon: Video, label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border overflow-hidden">
      {/* Gradient top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-96 bg-brand-600/5 blur-3xl pointer-events-none" />

      <div className="container-custom py-14 relative z-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <motion.div whileHover={{ rotate: [0, -10, 10, -5, 0] }} transition={{ duration: 0.4 }}>
                <ShoppingBag className="h-6 w-6 text-brand-600" />
              </motion.div>
              <span className="font-display font-bold text-lg">
                Smart<span className="text-brand-600">Picks</span> India
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India&apos;s trusted source for budget product reviews and Amazon deals. We help smart shoppers make better buying decisions.
            </p>

            {/* Social Icons */}
            <div className="mt-5 flex gap-2">
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-muted hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 transition-colors text-muted-foreground border border-transparent hover:border-brand-500/20"
                >
                  <s.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Link Columns */}
          {Object.entries(footerLinks).map(([title, links], colIdx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (colIdx + 1) * 0.1 }}
            >
              <h3 className="font-black text-foreground mb-5 text-xs uppercase tracking-widest">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-600 transition-colors"
                    >
                      <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-200">
                        <ArrowUpRight className="h-3 w-3 shrink-0" />
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-6 border-t border-border"
        >
          <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
            <strong>Affiliate Disclosure:</strong> Smart Picks India is a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to amazon.in. As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.
          </p>
          <p className="mt-4 text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
            © {new Date().getFullYear()} Smart Picks India. Made with{" "}
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
            </motion.span>{" "}
            in India. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
