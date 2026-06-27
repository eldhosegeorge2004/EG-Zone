/* eslint-disable */
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              EG ZONE
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/games" className="hover:text-gray-900 text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Games</Link>
              <Link href="/categories" className="hover:text-gray-900 text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Categories</Link>
              <Link href="/leaderboard" className="hover:text-gray-900 text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Leaderboard</Link>
              <Link href="/about" className="hover:text-gray-900 text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
            </div>
          </div>
          <div className="md:hidden flex items-center">
             <Link href="/games" className="text-sm text-indigo-600 font-bold">Play Now</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
