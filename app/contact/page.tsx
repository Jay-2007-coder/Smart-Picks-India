import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export const metadata = generateSEOMetadata({
  title: "Contact Us",
  description: "Get in touch with the Smart Picks India team for inquiries, feedback, or partnerships.",
});

export default function ContactPage() {
  return (
    <div className="container-custom py-12 max-w-3xl">
      <Breadcrumbs items={[{ label: "Contact Us" }]} />
      <h1 className="text-4xl font-display font-bold mt-6 mb-8">Contact Us</h1>
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <p className="text-muted-foreground mb-6">
            Have a question, feedback, or a product suggestion? We'd love to hear from you. Fill out the form or reach out directly.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-5 w-5 text-brand-600" />
              <a href="mailto:hello@smart-picks-india.vercel.app" className="hover:text-brand-600">hello@smart-picks-india.vercel.app</a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-5 w-5 text-brand-600" />
              <span>Mumbai, Maharashtra, India</span>
            </div>
          </div>
        </div>
        <form className="space-y-4">
          <input type="text" placeholder="Your Name" className="w-full p-3 rounded-xl border border-border bg-card" />
          <input type="email" placeholder="Your Email" className="w-full p-3 rounded-xl border border-border bg-card" />
          <textarea placeholder="Your Message" rows={4} className="w-full p-3 rounded-xl border border-border bg-card"></textarea>
          <button type="button" className="btn-primary w-full">Send Message</button>
        </form>
      </div>
    </div>
  );
}
