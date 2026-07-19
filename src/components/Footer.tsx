/* eslint-disable */
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="EG ZONE Logo" width={32} height={32} className="rounded-full shadow-sm opacity-80" />
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400">
                EG ZONE
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Play, compete, and improve your skills.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/blog" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Blog</Link>
            <Link href="/about" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">About</Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Contact</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Terms</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Privacy</Link>
            <Link href="/cookie" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Cookies</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} EG ZONE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
