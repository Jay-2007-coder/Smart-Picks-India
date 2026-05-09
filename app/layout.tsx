import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
  metadataBase: new URL("https://smartpicksindia.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://smartpicksindia.com",
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
        {/* Pinterest Rich Pins */}
        <meta name="p:domain_verify" content="41b175c4987172b0c7266d50e7598ec6" />
        {/* Google Analytics placeholder */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
