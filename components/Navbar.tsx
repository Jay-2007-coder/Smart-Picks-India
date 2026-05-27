"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingBag, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/deals", label: "🔥 Deals" },
  { href: "/category/tech", label: "Tech" },
  { href: "/category/kitchen", label: "Kitchen" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { query, setQuery, results, loading, open, setOpen, clear } = useSearch();
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setOpen]);

  const resultTypeUrl = (r: { type: string; slug: string }) => {
    if (r.type === "product") return `/product/${r.slug}`;
    if (r.type === "blog") return `/blog/${r.slug}`;
    return `/category/${r.slug}`;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="container-custom">
        <nav className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <ShoppingBag className="h-7 w-7 text-brand-600" />
            <span className="font-display text-lg font-bold">
              Smart<span className="text-brand-600">Picks</span> India
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search + Controls */}
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div ref={searchRef} className="relative hidden sm:block">
              <div className="flex items-center rounded-xl border border-border bg-muted/50 px-3 py-1.5 gap-2 w-56 focus-within:w-72 transition-all duration-300">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-sm bg-transparent outline-none w-full placeholder:text-muted-foreground"
                />
                {query && (
                  <button onClick={clear} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {/* Dropdown */}
              {open && (
                <div className="absolute top-full mt-2 w-80 right-0 bg-card border border-border rounded-2xl shadow-card-hover z-50 overflow-hidden">
                  {loading ? (
                    <div className="p-4 text-sm text-muted-foreground">Searching…</div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">No results found</div>
                  ) : (
                    <ul>
                      {results.map((r) => (
                        <li key={r.slug}>
                          <Link
                            href={resultTypeUrl(r)}
                            onClick={clear}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                          >
                            <span className="text-xs font-medium uppercase text-brand-500 bg-brand-50 dark:bg-brand-950 rounded-full px-2 py-0.5">
                              {r.type}
                            </span>
                            <span className="text-sm text-foreground line-clamp-1">{r.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Auth Link (Sign In / Dashboard) */}
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-xl border border-border bg-card hover:bg-muted transition-colors shrink-0"
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-950/40">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 hover:shadow-md transition-all active:scale-95 shrink-0"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <div className="pt-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth Button */}
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted transition-colors mt-2 border-t border-border/40 pt-3"
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-950/40">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-foreground leading-none">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Go to Dashboard</p>
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mx-3 mt-3 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-all text-center"
              >
                Sign In
              </Link>
            )}
          </div>
          {/* Mobile search */}
          <div className="mt-3 flex items-center rounded-xl border border-border bg-muted/50 px-3 py-2 gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm bg-transparent outline-none w-full"
            />
          </div>
        </div>
      )}
    </header>
  );
}
