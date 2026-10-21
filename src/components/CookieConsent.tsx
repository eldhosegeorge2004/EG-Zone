'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash immediately on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const rejectNonEssential = () => {
    localStorage.setItem('cookie_consent', 'essential_only');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0">🍪</div>

        {/* Text */}
        <div className="flex-1 text-sm text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-900 mb-1">We use cookies</p>
          <p>
            We use cookies and similar technologies, including from Google, to serve personalised ads, analyse traffic, and improve your experience. By clicking{' '}
            <strong>"Accept All"</strong>, you consent to our use of cookies. You can also choose to accept only essential cookies.{' '}
            <Link href="/cookie" className="text-blue-600 hover:underline font-medium">
              Cookie Policy
            </Link>{' '}
            &bull;{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={rejectNonEssential}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={acceptAll}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
