import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | EG ZONE",
  description: "Read the Privacy Policy for EG ZONE. Learn how we collect, use, and protect your data, and how third-party services like Google AdSense use cookies on our site.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-800">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Last updated: October 21, 2026</p>
      </div>

      <div className="space-y-8 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p>
            Welcome to <strong>EG ZONE</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We respect your privacy and are committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, and share information when you visit our website at{' '}
            <a href="https://egzone.com" className="text-blue-600 hover:underline">egzone.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
          <p>We may collect and use the following types of data:</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li><strong>Identity Data:</strong> Username or nickname you provide when submitting scores to our global leaderboard.</li>
            <li><strong>Technical Data:</strong> IP address, browser type and version, time zone, browser plug-ins, operating system, and other device information.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website, which games you play, and how long you spend on each page.</li>
            <li><strong>Cookie Data:</strong> Data collected through cookies placed by us and third-party partners (see Section 5 below).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Data</h2>
          <p>We use your personal data only when the law allows. Common uses include:</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>To display your scores on our public global leaderboard.</li>
            <li>To administer and improve our website, games, and services.</li>
            <li>To deliver relevant advertisements via <strong>Google AdSense</strong> and measure ad effectiveness.</li>
            <li>To analyse website traffic and user behaviour using <strong>Google Analytics</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
          <p>
            We process your personal data based on your consent (which you can withdraw at any time), our legitimate interest in running and improving our services, and compliance with applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Third-Party Advertising</h2>
          <p>
            Our website uses cookies — small text files placed on your device. We use cookies to remember your preferences and to allow third-party services to function.
          </p>
          <p className="mt-4">
            <strong>Google AdSense:</strong> We use Google AdSense to display advertisements. Google and its partners use cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this website and other websites across the internet. These cookies are placed by Google LLC and are governed by{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google&apos;s Privacy Policy</a>.
          </p>
          <p className="mt-4">
            You can opt out of personalised advertising by visiting{' '}
            <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google&apos;s Ads Settings</a>.
            You can also learn more about how Google uses data when you use our site by visiting{' '}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">How Google uses data when you use our partners&apos; sites or apps</a>.
          </p>
          <p className="mt-4">
            <strong>Google Analytics:</strong> We use Google Analytics to understand how visitors use our site. This may involve the use of cookies and the collection of your IP address. For more details, see{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google&apos;s Privacy Policy</a>.
          </p>
          <p className="mt-4">
            For a full description of how we use cookies, please see our{' '}
            <Link href="/cookie" className="text-blue-600 hover:underline font-semibold">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Sharing</h2>
          <p>
            We do not sell your personal data. We share data only with trusted third-party service providers (such as Google for advertising and analytics) strictly for the purposes described in this policy. These providers are required to process data securely and in accordance with applicable data protection law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
          <p>
            We retain your personal data only as long as necessary for the purposes set out in this policy, unless a longer retention period is required by law.
            Leaderboard entries are retained as long as the leaderboard service is active and may be deleted upon request.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction or deletion of your personal data.</li>
            <li>Withdraw consent for data processing at any time.</li>
            <li>Lodge a complaint with your local data protection authority.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
          <p>
            Our website is not directed to children under the age of 13. We do not knowingly collect personal data from children under 13. If you believe we have inadvertently collected such data, please contact us so we can delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to exercise any of your rights, please contact us via our{' '}
            <Link href="/contact" className="text-blue-600 hover:underline font-semibold">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
