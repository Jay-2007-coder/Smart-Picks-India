import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Privacy Policy | Smart Picks India",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-custom py-12 max-w-3xl">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <article className="prose prose-brand dark:prose-invert mt-8">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          At Smart Picks India, we are committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Smart Picks India.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We collect information from you when you subscribe to our newsletter, respond to a survey, or use our website. This may include your email address and usage data.
        </p>
        <h2>Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>
        <h2>Third-Party Links</h2>
        <p>
          Our website contains links to other websites, primarily Amazon.in, as part of our affiliate program. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites.
        </p>
      </article>
    </div>
  );
}
