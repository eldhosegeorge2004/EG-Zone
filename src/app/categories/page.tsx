/* eslint-disable */
import GameCard from "@/components/GameCard";
import { GAMES } from "@/lib/games";
import { Layers } from "lucide-react";

export default function CategoriesPage() {
  const categories = Array.from(new Set(GAMES.map(g => g.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-16 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-purple-100 rounded-2xl mb-6 shadow-sm">
          <Layers className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Categories</h1>
        <p className="text-gray-600 max-w-2xl mx-auto font-medium text-lg">
          Find games that match your mood. Whether you want to relax or challenge your brain, we've got you covered.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map(category => (
          <section key={category}>
            <div className="flex items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">{category}</h2>
              <div className="ml-4 flex-grow h-px bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {GAMES.filter(g => g.category === category).map((game) => (
                <GameCard key={game.slug} {...game} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
