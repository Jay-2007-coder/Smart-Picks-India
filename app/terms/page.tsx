import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Terms and Conditions | Smart Picks India",
};

export default function TermsPage() {
  return (
    <div className="container-custom py-12 max-w-3xl">
      <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />
      <article className="prose prose-brand dark:prose-invert mt-8">
        <h1>Terms and Conditions</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          Please read these terms and conditions carefully before using Our Service.
        </p>
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
        </p>
        <h2>Content Liability</h2>
        <p>
          Smart Picks India provides reviews and recommendations for informational purposes only. We shall not be held liable for any decisions you make based on the content provided on our site. Purchases made through our affiliate links are subject to the terms and conditions of the respective retailers (e.g., Amazon India).
        </p>
        <h2>Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
        </p>
      </article>
    </div>
  );
}
