/* eslint-disable */
import GameCard from "@/components/GameCard";
import { GAMES } from "@/lib/games";
import { Gamepad2 } from "lucide-react";

export default function GamesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-16 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-2xl mb-6 shadow-sm">
          <Gamepad2 className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">All Games</h1>
        <p className="text-gray-600 max-w-2xl mx-auto font-medium text-lg">
          Explore our collection of premium mini-games. Find your favorite and start playing instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {GAMES.map((game) => (
          <GameCard key={game.slug} {...game} />
        ))}
      </div>
    </div>
  );
}
