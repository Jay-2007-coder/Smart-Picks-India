import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = generateSEOMetadata({
  title: "About Us",
  description: "Learn more about Smart Picks India and our mission to help Indian shoppers make smarter buying decisions.",
});

export default function AboutPage() {
  return (
    <div className="container-custom py-12 max-w-3xl">
      <Breadcrumbs items={[{ label: "About Us" }]} />
      <h1 className="text-4xl font-display font-bold mt-6 mb-8">About Smart Picks India</h1>
      <div className="prose prose-brand dark:prose-invert">
        <p className="lead text-xl text-muted-foreground mb-8">
          We are on a mission to simplify online shopping for Indians by providing honest reviews and finding the best budget deals.
        </p>
        <h2>Our Story</h2>
        <p>
          Founded in 2024, Smart Picks India started with a simple observation: the Indian e-commerce space is crowded with too many options and fake reviews. We wanted to create a trusted space where shoppers could find reliable recommendations for products that offer the best value for money.
        </p>
        <h2>How We Review</h2>
        <p>
          Our team spends hours researching, comparing, and (wherever possible) hands-on testing products before recommending them. We look at:
        </p>
        <ul>
          <li><strong>Value for Money:</strong> Does this product justify its price tag?</li>
          <li><strong>Durability:</strong> Will it last in Indian conditions?</li>
          <li><strong>User Feedback:</strong> What are verified buyers saying after months of use?</li>
        </ul>
        <h2>The Affiliate Model</h2>
        <p>
          To keep our content free, we participate in the Amazon Associates program. When you buy a product through our links, we earn a small commission at zero extra cost to you. This helps us pay our writers and keep the site running.
        </p>
      </div>
    </div>
  );
}
