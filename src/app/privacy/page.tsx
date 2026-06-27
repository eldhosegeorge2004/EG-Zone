import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-800">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Last updated: June 27, 2026</p>
      </div>
      
      <div className="space-y-8 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p>
            Welcome to EG ZONE. We respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. The Data We Collect About You</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li><strong>Identity Data:</strong> includes username or similar identifier when you submit high scores to our global leaderboard.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Usage Data:</strong> includes information about how you use our website and games.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>To display your scores on public leaderboards.</li>
            <li>To administer and protect our business and this website (including troubleshooting, data analysis, testing, system maintenance, support, reporting and hosting of data).</li>
            <li>To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve to you (e.g., via Google AdSense).</li>
            <li>To use data analytics to improve our website, products/services, marketing, customer relationships and experiences (e.g., via Google Analytics).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Links & Services</h2>
          <p>
            This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. 
            Specifically, we use third party vendors, including Google, which use cookies to serve ads based on a user's prior visits to our website or other websites.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, including any requests to exercise your legal rights, please contact us via our <Link href="/contact" className="text-indigo-600 hover:underline font-semibold">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
