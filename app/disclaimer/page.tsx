import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Disclaimer | Smart Picks India",
};

export default function DisclaimerPage() {
  return (
    <div className="container-custom py-12 max-w-3xl">
      <Breadcrumbs items={[{ label: "Disclaimer" }]} />
      <article className="prose prose-brand dark:prose-invert mt-8">
        <h1>Disclaimer</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2 id="affiliate">Affiliate Disclaimer</h2>
        <p>
          Smart Picks India is a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in.
        </p>
        <p>
          This means that whenever you buy a product on Amazon from a link on here, we get a small percentage of its price. That helps support Smart Picks India with some money to maintain the site, and is very much appreciated.
        </p>
        <h2>Information Accuracy</h2>
        <p>
          We do our best to ensure that the information on this website is accurate and up-to-date. However, product prices, availability, and specifications are subject to change by the manufacturer or the retailer. Always verify the details on the seller's website before making a purchase.
        </p>
      </article>
    </div>
  );
}
