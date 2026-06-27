/* eslint-disable */
import SnakeGame from "@/games/snake/SnakeGame";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Snake | GameHub",
  description: "Play the classic Snake game online. Eat food, grow longer, and beat your high score.",
};

export default function SnakePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Snake</h1>
        <p className="text-gray-600 font-medium">Classic arcade fun. Don't bite your own tail!</p>
      </div>

      <SnakeGame />
    </div>
  );
}
