"use client";
import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Mock backend — store in localStorage
    await new Promise((r) => setTimeout(r, 1000));
    const existing = JSON.parse(localStorage.getItem("spi_newsletter") || "[]");
    existing.push({ email, date: new Date().toISOString() });
    localStorage.setItem("spi_newsletter", JSON.stringify(existing));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 sm:p-12 text-white text-center">
      <div className="max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
          <Mail className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Get the Best Deals in Your Inbox</h2>
        <p className="text-brand-100 mb-8">
          Join 50,000+ smart Indian shoppers who get our weekly curated deals and honest reviews.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-3 text-lg font-semibold">
            <CheckCircle className="h-6 w-6 text-green-400" />
            You&apos;re subscribed! Welcome to the community 🎉
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-brand-200 focus:outline-none focus:ring-2 focus:ring-white/40"
              id="newsletter-email"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary bg-white text-brand-700 hover:bg-brand-50 shrink-0"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Subscribe Free"
              )}
            </button>
          </form>
        )}
        <p className="mt-4 text-xs text-brand-200">No spam. Unsubscribe anytime. 100% free.</p>
      </div>
    </section>
  );
}
