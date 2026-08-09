import Link from "next/link";
import { ShoppingBag, Camera, MessageCircle, Video } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Footer — Server Component (no client JS needed)
───────────────────────────────────────────────────────── */

const footerLinks = {
  Products: [
    { href: "/",              label: "Home"          },
    { href: "/deals",         label: "Today's Deals" },
    { href: "/digital-store", label: "Digital Store" },
    { href: "/compare",       label: "Compare"       },
    { href: "/search",        label: "Search"        },
  ],
  "Student Hub": [
    { href: "/student-hub",                      label: "Overview"       },
    { href: "/student-hub/resume-analyzer",      label: "ATS Analyzer"   },
    { href: "/student-hub/resume-builder",       label: "Resume Builder"  },
    { href: "/student-hub/coding-helper",        label: "DSA Helper"      },
    { href: "/student-hub/roadmaps",             label: "Career Roadmaps" },
    { href: "/student-hub/interview-generator",  label: "Interview Prep"  },
  ],
  Company: [
    { href: "/blog",      label: "Blog"      },
    { href: "/about",     label: "About Us"  },
    { href: "/contact",   label: "Contact"   },
    { href: "/affiliate", label: "Affiliate" },
  ],
  Legal: [
    { href: "/privacy-policy",       label: "Privacy Policy"      },
    { href: "/terms",                label: "Terms & Conditions"   },
    { href: "/disclaimer",           label: "Disclaimer"           },
    { href: "/disclaimer#affiliate", label: "Affiliate Disclosure" },
  ],
} as const;

const socialLinks = [
  { href: "https://www.instagram.com/indiasmartpicks/", icon: Camera,        label: "Instagram" },
  { href: "https://twitter.com",                        icon: MessageCircle, label: "Twitter"   },
  { href: "https://youtube.com",                        icon: Video,         label: "YouTube"   },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30" role="contentinfo">
      <div className="container-custom py-12 sm:py-16">

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              aria-label="Smart Picks India — home"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shrink-0"
                aria-hidden="true"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className="font-semibold text-sm text-foreground select-none">
                Smart<span className="text-brand-600">Picks</span> India
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              India&apos;s trusted platform for curated Amazon deals, digital
              products, and free AI career tools for students.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2" aria-label="Social media links">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${s.label}`}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <s.icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-foreground mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Smart Picks India. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right max-w-md leading-relaxed">
            Smart Picks India is an Amazon Associates affiliate. We earn from
            qualifying purchases at no extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  );
}
