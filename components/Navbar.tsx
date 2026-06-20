"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingBag, Sun, Moon, Search, Sparkles, Home, Flame, Store, GraduationCap, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/deals", label: "Deals", icon: Flame },
  { href: "/digital-store", label: "Store", icon: Store },
  { href: "/student-hub", label: "Student Hub", icon: GraduationCap },
  { href: "/blog", label: "Blog", icon: BookOpen },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);
  const { query, setQuery, results, loading, open, setOpen, clear } = useSearch();
  const { user, logout } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();

  // Scroll tracking
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Click away tracking
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

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-2xl border-b border-border/50 shadow-md"
          : "bg-background/80 backdrop-blur-xl border-b border-border/10"
      )}
    >
      {/* Top brand-gradient line border */}
      <div className="h-[2px] w-full bg-gradient-to-r from-brand-600 via-indigo-500 to-rose-500" />
      
      {/* Reading progress indicator line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500 via-accent-400 to-rose-500 origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      
      <div className="container-custom">
        <nav className="flex h-16 items-center justify-between gap-3">
          
          {/* LEFT PARTITION: Logo branding */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 group select-none">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.05 }}
                transition={{ duration: 0.35 }}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/10 dark:border-brand-500/20 text-brand-600 shadow-sm"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
              </motion.div>
              <span className="font-display text-base font-extrabold tracking-tight text-foreground">
                Smart<span className="text-brand-600">Picks</span>{" "}
                <span className="text-muted-foreground/85 font-normal text-xs uppercase tracking-wider hidden sm:inline-block">India</span>
              </span>
            </Link>
            
            {/* Visual Partition Divider 1 */}
            <div className="hidden md:block h-5 w-px bg-border/60 shrink-0 ml-1.5" />
          </div>

          {/* CENTER PARTITION: Main Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 select-none flex items-center gap-1.5 border border-transparent",
                    isActive
                      ? "text-brand-600 dark:text-brand-400 font-extrabold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 dark:border-brand-500/20 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground/80")} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* RIGHT PARTITION: Search & Actions */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto md:ml-0">
            
            {/* Visual Partition Divider 2 */}
            <div className="hidden md:block h-5 w-px bg-border/60 shrink-0 mr-1" />

            {/* Search Input Box */}
            <div ref={searchRef} className="relative hidden sm:block">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  setOpen(false);
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }
              }}>
                <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5 gap-2 w-44 focus-within:w-64 focus-within:border-brand-500/40 focus-within:bg-background focus-within:ring-2 focus-within:ring-brand-500/5 transition-all duration-300 focus-within:shadow-md">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search tools, blogs..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-xs bg-transparent outline-none w-full placeholder:text-muted-foreground font-semibold"
                  />
                  
                  {/* Keyboard shortcut help indicator */}
                  {!query && (
                    <div className="hidden md:flex items-center gap-0.5 select-none text-[9px] font-bold text-muted-foreground/50 bg-muted border border-border/60 px-1 py-0.5 rounded shrink-0">
                      <span>⌘</span>K
                    </div>
                  )}

                  {query && (
                    <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Search Result Dropdown Overlay */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full mt-2.5 w-96 right-0 bg-background/85 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[450px] overflow-y-auto"
                  >
                    {loading ? (
                      <div className="p-4 text-xs font-bold text-muted-foreground flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500 border-t-transparent" />
                        Analyzing Index...
                      </div>
                    ) : results.length === 0 ? (
                      <div className="p-4 text-xs font-bold text-muted-foreground">No matches found. Try another query.</div>
                    ) : (
                      <div className="p-2 flex flex-col gap-3">
                        {results.filter(r => r.type === "product").length > 0 && (
                          <div>
                            <div className="px-3 py-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1.5 mb-1.5">
                              Recommended Products
                            </div>
                            <ul className="flex flex-col gap-0.5">
                              {results.filter(r => r.type === "product").map((r) => (
                                <li key={r.slug}>
                                  <Link
                                    href={resultTypeUrl(r)}
                                    onClick={clear}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-brand-500/5 dark:hover:bg-brand-500/10 rounded-xl transition-all duration-200 hover:scale-[1.01] group/item"
                                  >
                                    {r.image && (
                                      <img src={r.image} alt={r.title} className="h-8.5 w-8.5 rounded-lg object-cover bg-muted border border-border/40 group-hover/item:scale-105 transition-transform duration-200" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-foreground group-hover/item:text-brand-600 dark:group-hover/item:text-brand-400 transition-colors truncate">{r.title}</p>
                                      {r.price && <p className="text-[10px] text-brand-600 font-extrabold mt-0.5">₹{r.price}</p>}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.filter(r => r.type === "blog").length > 0 && (
                          <div>
                            <div className="px-3 py-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1.5 mb-1.5">
                              Expert Articles
                            </div>
                            <ul className="flex flex-col gap-0.5">
                              {results.filter(r => r.type === "blog").map((r) => (
                                <li key={r.slug}>
                                  <Link
                                    href={resultTypeUrl(r)}
                                    onClick={clear}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-brand-500/5 dark:hover:bg-brand-500/10 rounded-xl transition-all duration-200 hover:scale-[1.01] group/item"
                                  >
                                    {r.image && (
                                      <img src={r.image} alt={r.title} className="h-8.5 w-8.5 rounded-lg object-cover bg-muted border border-border/40 group-hover/item:scale-105 transition-transform duration-200" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-foreground group-hover/item:text-brand-600 dark:group-hover/item:text-brand-400 transition-colors truncate">{r.title}</p>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.filter(r => r.type === "category").length > 0 && (
                          <div>
                            <div className="px-3 py-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1.5 mb-1.5">
                              Shopping Categories
                            </div>
                            <ul className="flex flex-col gap-0.5">
                              {results.filter(r => r.type === "category").map((r) => (
                                <li key={r.slug}>
                                  <Link
                                    href={resultTypeUrl(r)}
                                    onClick={clear}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-brand-500/5 dark:hover:bg-brand-500/10 rounded-xl transition-all duration-200 hover:scale-[1.01] group/item"
                                  >
                                    <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-600 group-hover/item:text-brand-550 group-hover/item:scale-105 shrink-0 border border-brand-500/10 transition-all duration-200">
                                      <Sparkles className="h-4 w-4 animate-pulse" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-foreground group-hover/item:text-brand-600 dark:group-hover/item:text-brand-400 transition-colors truncate">{r.title}</p>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="border-t border-border mt-1.5 pt-2.5 px-3 pb-1 flex justify-between items-center">
                          <span className="text-[9px] font-bold text-muted-foreground/60">Press enter for global filters</span>
                          <Link
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={clear}
                            className="text-xs text-brand-600 font-extrabold hover:underline"
                          >
                            View all results &rarr;
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Visual Partition Divider 3 */}
            <div className="hidden sm:block h-4 w-px bg-border/60 shrink-0 mx-0.5" />

            {/* Theme Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground cursor-pointer shadow-sm shrink-0"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {!mounted ? (
                  <div className="h-4.5 w-4.5" />
                ) : theme === "dark" ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="h-4.5 w-4.5 text-amber-500" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="h-4.5 w-4.5 text-indigo-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Visual Partition Divider 4 */}
            <div className="hidden sm:block h-4 w-px bg-border/60 shrink-0 mx-0.5" />

            {/* User Profile / Auth Action */}
            {user ? (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border bg-card hover:bg-muted/65 transition-all shrink-0 cursor-pointer shadow-sm",
                    user.role === "admin" || user.hubPlan === "pro"
                      ? "border-brand-500/40 ring-1 ring-brand-500/10 hover:border-brand-500/50"
                      : "border-border hover:border-brand-500/30"
                  )}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className={cn(
                        "h-5.5 w-5.5 rounded-full object-cover ring-2",
                        user.role === "admin" || user.hubPlan === "pro" ? "ring-brand-500/30" : "ring-brand-500/10"
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-5.5 w-5.5 items-center justify-center rounded-full text-[9px] font-black text-white shadow-sm",
                        user.role === "admin" || user.hubPlan === "pro"
                          ? "bg-gradient-to-tr from-amber-500 via-brand-500 to-rose-500"
                          : "bg-gradient-to-tr from-brand-500 to-rose-500"
                      )}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
                  {(user.role === "admin" || user.hubPlan === "pro") && (
                    <span className="inline-flex items-center text-[9px] font-black text-brand-600 dark:text-brand-400 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 px-1.5 py-0.5 rounded-lg leading-none shadow-sm uppercase tracking-wider">
                      {user.role === "admin" ? "⚡ ADMIN" : "⚡ PRO"}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-52 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 flex flex-col gap-0.5"
                    >
                      <div className="px-3 py-2.5 border-b border-border/60 mb-1.5 flex flex-col gap-1 select-none">
                        <span className="text-[10px] font-bold text-muted-foreground truncate leading-none">
                          {user.email}
                        </span>
                        <div className="flex items-center mt-0.5">
                          {user.role === "admin" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-widest leading-none">
                              ⚡ ADMIN
                            </span>
                          ) : user.hubPlan === "pro" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 uppercase tracking-widest leading-none">
                              ⚡ PRO MEMBER
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-muted text-muted-foreground border border-border uppercase tracking-widest leading-none">
                              FREE TIER
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted/70 rounded-xl transition-colors"
                      >
                        User Dashboard
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="block w-full px-3.5 py-2 text-xs font-black text-rose-500 hover:bg-rose-500/5 rounded-xl transition-colors border-t border-border/40 mt-1 pt-2"
                        >
                          System Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          setDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-colors cursor-pointer border-t border-border/40 mt-1 pt-2"
                      >
                        Logout Session
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="shrink-0">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 px-4.5 py-1.5 text-xs font-black text-white shadow shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/15 hover:from-brand-700 hover:to-rose-700 transition-all shrink-0 cursor-pointer btn-shiny"
                >
                  Sign In
                </Link>
              </motion.div>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-1.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/60 transition-all shrink-0 text-muted-foreground hover:text-foreground"
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

      {/* Mobile Menu Slide Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden px-4 pb-5 shadow-2xl"
          >
            <div className="pt-3 flex flex-col gap-1">
              {navLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 + 0.02 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-xl hover:bg-muted/80 transition-colors",
                        pathname === link.href ? "bg-brand-500/5 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold border border-brand-500/10" : "border border-transparent"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground/80" />
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {user && user.role === "admin" && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.04 }}
                >
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3.5 py-2.5 text-xs font-black text-rose-500 rounded-xl hover:bg-rose-500/5 transition-colors border border-transparent"
                  >
                    System Admin Panel
                  </Link>
                </motion.div>
              )}

              {/* Mobile Auth Button */}
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-xl hover:bg-muted/80 transition-colors mt-3 border-t border-border/40 pt-3.5"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className={cn(
                        "h-7 w-7 rounded-full object-cover",
                        (user.role === "admin" || user.hubPlan === "pro") && "ring-2 ring-brand-500/30"
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow-sm",
                        user.role === "admin" || user.hubPlan === "pro"
                          ? "bg-gradient-to-tr from-amber-500 via-brand-500 to-rose-500"
                          : "bg-brand-600"
                      )}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-extrabold text-foreground leading-none">{user.name}</p>
                      {(user.role === "admin" || user.hubPlan === "pro") && (
                        <span className="inline-flex items-center text-[8px] text-brand-600 dark:text-brand-400 font-black gap-0.5 bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.5 rounded leading-none uppercase tracking-wider">
                          {user.role === "admin" ? "ADMIN" : "PRO"}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                      {user.role === "admin" ? "⚡ Admin Active • " : user.hubPlan === "pro" ? "⚡ Pro Active • " : ""}Open Dashboard &rarr;
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mx-1 mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 px-4 py-2.5 text-xs font-black text-white shadow shadow-brand-500/10 transition-all text-center"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile search form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  setMobileOpen(false);
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }
              }}
              className="mt-4 border-t border-border/40 pt-3.5"
            >
              <div className="flex items-center rounded-xl border border-border/80 bg-muted/30 px-3.5 py-2.5 gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, tools, blogs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-xs bg-transparent outline-none w-full font-bold"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
