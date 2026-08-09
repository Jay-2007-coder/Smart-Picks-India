"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ShoppingBag,
  Sun,
  Moon,
  Search,
  Home,
  Flame,
  Store,
  GraduationCap,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",             label: "Home",        icon: Home          },
  { href: "/deals",        label: "Deals",       icon: Flame         },
  { href: "/digital-store", label: "Store",      icon: Store         },
  { href: "/student-hub",  label: "Student Hub", icon: GraduationCap },
  { href: "/blog",         label: "Blog",        icon: BookOpen      },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [mounted, setMounted]           = useState(false);
  const { theme, setTheme }             = useTheme();
  const { query, setQuery, results, loading, open, setOpen, clear } = useSearch();
  const { user, logout }                = useAuth();
  const searchRef                       = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);
  const dropdownRef                     = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname                        = usePathname();

  useEffect(() => setMounted(true), []);

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setOpen]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const resultUrl = (r: { type: string; slug: string }) => {
    if (r.type === "product") return `/product/${r.slug}`;
    if (r.type === "blog")    return `/blog/${r.slug}`;
    return `/category/${r.slug}`;
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";
  const isAdmin = user?.role === "admin";
  const isPro   = user?.hubPlan === "pro";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background border-b border-border transition-shadow duration-200",
        scrolled && "shadow-sm"
      )}
      role="banner"
    >
      <div className="container-custom">
        <nav className="flex h-16 items-center gap-3" aria-label="Main navigation">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            aria-label="Smart Picks India — home"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shrink-0"
              aria-hidden="true"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            </div>
            <span className="font-semibold text-[15px] text-foreground hidden sm:block select-none">
              Smart<span className="text-brand-600">Picks</span> India
            </span>
          </Link>

          {/* Separator */}
          <div className="hidden md:block h-5 w-px bg-border shrink-0" aria-hidden="true" />

          {/* ── Desktop nav links ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0.5 flex-1" role="list">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="listitem"
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right section ─────────────────────────────────── */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Search */}
            <div ref={searchRef} className="relative hidden sm:block">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) {
                    setOpen(false);
                    window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                  }
                }}
              >
                <div
                  className={cn(
                    "flex items-center rounded-lg border bg-muted/50 px-3 py-2 gap-2",
                    "w-44 focus-within:w-60 transition-all duration-200",
                    "focus-within:bg-background focus-within:border-gray-300",
                    open ? "border-gray-300 bg-background w-60" : "border-border"
                  )}
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} aria-hidden="true" />
                  <input
                    ref={inputRef}
                    type="search"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-sm bg-transparent outline-none w-full placeholder:text-muted-foreground"
                    aria-label="Search products and articles"
                    aria-expanded={open}
                    aria-controls="search-results"
                    aria-autocomplete="list"
                    autoComplete="off"
                  />
                  {!query && (
                    <kbd className="hidden md:flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border px-1.5 py-0.5 rounded shrink-0 select-none">
                      ⌘K
                    </kbd>
                  )}
                  {query && (
                    <button
                      type="button"
                      onClick={clear}
                      className="text-muted-foreground hover:text-foreground shrink-0 transition-colors focus-visible:outline-none"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </form>

              {/* Search results dropdown */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    id="search-results"
                    role="listbox"
                    aria-label="Search results"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full mt-2 right-0 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    {loading ? (
                      <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" aria-hidden="true" />
                        Searching...
                      </div>
                    ) : results.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        No results for &ldquo;{query}&rdquo;
                      </div>
                    ) : (
                      <div className="py-2">
                        {(["product", "blog", "category"] as const).map((type) => {
                          const filtered = results.filter((r) => r.type === type);
                          if (!filtered.length) return null;
                          const labels: Record<string, string> = {
                            product: "Products",
                            blog: "Articles",
                            category: "Categories",
                          };
                          return (
                            <div key={type}>
                              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {labels[type]}
                              </p>
                              {filtered.map((r) => (
                                <Link
                                  key={r.slug}
                                  href={resultUrl(r)}
                                  onClick={clear}
                                  role="option"
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors"
                                >
                                  {r.image && (
                                    <img
                                      src={r.image}
                                      alt=""
                                      className="h-8 w-8 rounded-md object-cover bg-muted border border-border shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate">{r.title}</p>
                                    {r.price && (
                                      <p className="text-xs text-brand-600 font-medium">₹{r.price}</p>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          );
                        })}
                        <div className="border-t border-border mt-1 pt-1 px-3 pb-2">
                          <Link
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={clear}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                          >
                            View all results →
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                )}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun  className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Moon className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            )}

            {/* Auth — user dropdown or sign-in buttons */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted",
                    "transition-colors text-sm font-medium",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  )}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  aria-label="User menu"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-border shrink-0"
                    />
                  ) : (
                    <div
                      className="h-6 w-6 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      {userInitial}
                    </div>
                  )}
                  <span className="hidden lg:block text-foreground max-w-[80px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  {(isAdmin || isPro) && (
                    <span className="hidden lg:block badge-brand text-[10px] font-semibold">
                      {isAdmin ? "Admin" : "Pro"}
                    </span>
                  )}
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-150", dropdownOpen && "rotate-180")}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      role="menu"
                      aria-label="User account menu"
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-1.5 w-48 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      {/* User info */}
                      <div className="px-3 py-2.5 border-b border-border">
                        <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                          Dashboard
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            role="menuitem"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                            Admin Panel
                          </Link>
                        )}

                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            role="menuitem"
                            onClick={async () => { setDropdownOpen(false); await logout(); }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"    className="btn-secondary btn-sm">Sign in</Link>
                <Link href="/register" className="btn-primary  btn-sm hidden sm:inline-flex">Get started</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className={cn(
                "md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen
                ? <X    className="h-5 w-5" strokeWidth={2} />
                : <Menu className="h-5 w-5" strokeWidth={2} />
              }
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container-custom py-4 flex flex-col gap-1">

              {/* Nav links */}
              {navLinks.map((link) => {
                const Icon     = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <Shield className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  Admin Panel
                </Link>
              )}

              {/* Mobile search */}
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) {
                    setMobileOpen(false);
                    window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                  }
                }}
                className="mt-2 border-t border-border pt-3"
              >
                <div className="flex items-center rounded-lg border border-border bg-muted/50 px-3 py-2.5 gap-2">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search products, articles..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-sm bg-transparent outline-none w-full placeholder:text-muted-foreground"
                    aria-label="Search"
                  />
                </div>
              </form>

              {/* Mobile auth */}
              {user ? (
                <div className="mt-2 border-t border-border pt-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center shrink-0" aria-hidden="true">
                        {userInitial}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">View dashboard →</p>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="mt-2 border-t border-border pt-3 flex flex-col gap-2">
                  <Link href="/login"    onClick={() => setMobileOpen(false)} className="btn-secondary w-full justify-center">Sign in</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary  w-full justify-center">Get started free</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
