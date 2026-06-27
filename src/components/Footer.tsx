/* eslint-disable */
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              EG ZONE
            </span>
            <p className="mt-2 text-sm text-gray-500">Play, compete, and improve your skills.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">About</Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Contact</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Terms</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Privacy</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} EG ZONE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
