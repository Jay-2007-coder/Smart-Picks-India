import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/use-auth";
import { CompareProvider } from "@/hooks/useCompare";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import StickyCompareBar from "@/components/StickyCompareBar";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://smart-picks-india.vercel.app";
};
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: "Smart Picks India — India's Smartest Budget Picks",
    template: "%s | Smart Picks India",
  },
  description:
    "Discover the best budget products in India. Expert reviews, Amazon deals, and recommendations on tech, kitchen, home, gadgets for smart Indian shoppers.",
  keywords: ["best products India", "budget picks India", "Amazon India deals", "smart shopping India"],
  authors: [{ name: "Smart Picks India" }],
  creator: "Smart Picks India",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Smart Picks India",
    images: [{ url: "/og/default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@smartpicksindia",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Amazon CDN preconnect — resolves DNS before product images load */}
        <link rel="preconnect" href="https://m.media-amazon.com" />
        <link rel="dns-prefetch" href="https://m.media-amazon.com" />
        <link rel="preconnect" href="https://images-na.ssl-images-amazon.com" />
        <link rel="dns-prefetch" href="https://images-na.ssl-images-amazon.com" />
        {/* Pinterest Rich Pins */}
        <meta name="p:domain_verify" content="41b175c4987172b0c7266d50e7598ec6" />
        {/* 
          Google Analytics 4 setup. 
          To configure, set NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX in .env.local 
        */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Suspense fallback={null}>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          </Suspense>
        )}
      </head>

      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <CompareProvider>
              <div className="flex min-h-screen flex-col bg-background">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <AIChatbot />
                <StickyCompareBar />
                <ScrollToTop />
                <Analytics />
              </div>
            </CompareProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
