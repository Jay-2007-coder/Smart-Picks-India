"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingBag, Sun, Moon, Search, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/deals", label: "🔥 Deals" },
  { href: "/digital-store", label: "🎒 Store" },
  { href: "/student-hub", label: "⚡ Student Hub" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { query, setQuery, results, loading, open, setOpen, clear } = useSearch();
  const { user, logout } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const resultTypeUrl = (r: { type: string; slug: string }) => {
    if (r.type === "product") return `/product/${r.slug}`;
    if (r.type === "blog") return `/blog/${r.slug}`;
    return `/category/${r.slug}`;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-md shadow-black/5"
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="container-custom">
        <nav className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
            >
              <ShoppingBag className="h-7 w-7 text-brand-600" />
            </motion.div>
            <span className="font-display text-lg font-bold">
              Smart<span className="text-brand-600">Picks</span>{" "}
              <span className="hidden sm:inline">India</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-brand-600"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-600 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            {/* Admin link moved to avatar dropdown */}
          </div>

          {/* Search + Controls */}
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div ref={searchRef} className="relative hidden sm:block">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  setOpen(false);
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }
              }}>
                <div className="flex items-center rounded-xl border border-border bg-muted/50 px-3 py-1.5 gap-2 w-48 focus-within:w-80 focus-within:border-brand-500/50 focus-within:bg-background transition-all duration-300 focus-within:shadow-md">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products, blogs..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-sm bg-transparent outline-none w-full placeholder:text-muted-foreground"
                  />
                  {query && (
                    <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </form>
              {/* Search Dropdown */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full mt-2 w-96 right-0 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-xl z-50 overflow-hidden max-h-[450px] overflow-y-auto"
                  >
                    {loading ? (
                      <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500 border-t-transparent" />
                        Searching…
                      </div>
                    ) : results.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">No results found</div>
                    ) : (
                      <div className="p-2 flex flex-col gap-3">
                        {results.filter(r => r.type === "product").length > 0 && (
                          <div>
                            <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Products
                            </div>
                            <ul className="mt-1 flex flex-col gap-0.5">
                              {results.filter(r => r.type === "product").map((r) => (
                                <li key={r.slug}>
                                  <Link
                                    href={resultTypeUrl(r)}
                                    onClick={clear}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-xl transition-colors"
                                  >
                                    {r.image && (
                                      <img src={r.image} alt={r.title} className="h-8 w-8 rounded-lg object-cover bg-muted" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                                      {r.price && <p className="text-xs text-brand-600 font-semibold">₹{r.price}</p>}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.filter(r => r.type === "blog").length > 0 && (
                          <div>
                            <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Articles
                            </div>
                            <ul className="mt-1 flex flex-col gap-0.5">
                              {results.filter(r => r.type === "blog").map((r) => (
                                <li key={r.slug}>
                                  <Link
                                    href={resultTypeUrl(r)}
                                    onClick={clear}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-xl transition-colors"
                                  >
                                    {r.image && (
                                      <img src={r.image} alt={r.title} className="h-8 w-8 rounded-lg object-cover bg-muted" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.filter(r => r.type === "category").length > 0 && (
                          <div>
                            <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Categories
                            </div>
                            <ul className="mt-1 flex flex-col gap-0.5">
                              {results.filter(r => r.type === "category").map((r) => (
                                <li key={r.slug}>
                                  <Link
                                    href={resultTypeUrl(r)}
                                    onClick={clear}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-xl transition-colors"
                                  >
                                    <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-600">
                                      <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="border-t border-border mt-1 pt-2 px-3 pb-1 flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground">Press Enter to search all</span>
                          <Link
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={clear}
                            className="text-xs text-brand-600 font-bold hover:underline"
                          >
                            View all results
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Auth Link with Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-xl border border-border bg-card hover:bg-muted transition-colors shrink-0 hover:border-brand-500/20 cursor-pointer"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="h-6 w-6 rounded-full object-cover ring-2 ring-brand-500/20" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 flex flex-col gap-1"
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={async () => {
                          setDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-colors cursor-pointer"
                      >
                        Logout
                      </button>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="block w-full px-4 py-2.5 text-xs font-black text-red-600 hover:bg-red-500/10 rounded-xl transition-colors border-t border-border mt-1 pt-2"
                        >
                          Admin Panel
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 hover:shadow-md transition-all active:scale-95 shrink-0"
                >
                  Sign In
                </Link>
              </motion.div>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden px-4 pb-4"
          >
            <div className="pt-3 flex flex-col gap-1">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 + 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors",
                      pathname === link.href ? "bg-brand-50 dark:bg-brand-950/30 text-brand-600 font-bold" : ""
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {user && (user as any).role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-bold text-red-500 rounded-xl hover:bg-red-500/5 transition-colors"
                >
                  Admin Panel
                </Link>
              )}

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
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  setMobileOpen(false);
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }
              }}
              className="mt-3"
            >
              <div className="flex items-center rounded-xl border border-border bg-muted/50 px-3 py-2 gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, blogs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-sm bg-transparent outline-none w-full"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
