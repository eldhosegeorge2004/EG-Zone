/* eslint-disable */
import GameCard from "@/components/GameCard";
import { Gamepad2, Brain, Keyboard, Zap, Hash, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { GAMES } from "@/lib/games";

export default function Home() {
  // Use first 5 games from GAMES array
  const featuredGames = GAMES.slice(0, 5);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden py-24 sm:py-32 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white -z-10" />
        
        <div className="px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/10 mb-8 bg-indigo-50 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
            Premium Mini-Games Available
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 mb-6">
            Play, Compete, and <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Sharpen Your Skills
            </span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto font-medium">
            EG ZONE is your ultimate destination for quick, fun, and challenging mini-games. 
            Test your reflexes, improve your memory, and climb the global leaderboards.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/games" 
              className="rounded-full bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-700/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center"
            >
              Start Playing <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              href="/leaderboard" 
              className="rounded-full px-8 py-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center"
            >
              View Leaderboards <Trophy className="ml-2 w-4 h-4 text-amber-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Featured Games</h2>
            <p className="mt-2 text-lg leading-8 text-gray-600 font-medium">
              Jump right into our most popular challenges.
            </p>
          </div>
          <Link href="/games" className="hidden sm:flex items-center text-indigo-600 hover:text-indigo-700 font-bold transition-colors bg-indigo-50 px-4 py-2 rounded-full">
            View all games <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGames.map((game) => (
            <GameCard key={game.slug} {...game} />
          ))}
        </div>
        
        <div className="mt-10 flex justify-center sm:hidden">
          <Link href="/games" className="flex items-center text-indigo-600 hover:text-indigo-700 font-bold transition-colors bg-indigo-50 px-6 py-3 rounded-full">
            View all games <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
