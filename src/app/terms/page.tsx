import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-gray-800">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Last updated: June 27, 2026</p>
      </div>
      
      <div className="space-y-8 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using EG ZONE ("the Website"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
          <p>
            EG ZONE provides users with access to a rich collection of resources, including various online mini-games and global leaderboards. You understand and agree that the Service is provided "AS-IS" and that EG ZONE assumes no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
          <p>
            As a condition of use, you promise not to use the Services for any purpose that is unlawful or prohibited by these Terms. By way of example, and not as a limitation, you agree not to:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>Submit scores to the leaderboard using automated means, bots, or cheats.</li>
            <li>Use the Website in any manner that could damage, disable, overburden, or impair the Website.</li>
            <li>Submit inappropriate or offensive usernames to the public leaderboard.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
          <p>
            All original graphics, sounds, and code used on this website are the property of EG ZONE. The games hosted on this site are either originally developed by EG ZONE or utilize assets with licenses that allow commercial use. You may not modify, publish, transmit, participate in the transfer or sale, create derivative works, or in any way exploit, any of the content, in whole or in part, without express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Modifications to Service</h2>
          <p>
            EG ZONE reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that EG ZONE shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Information</h2>
          <p>
            If you have any questions regarding these Terms, please contact us via our <Link href="/contact" className="text-indigo-600 hover:underline font-semibold">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
