/* eslint-disable */
import SnakeGame from "@/games/snake/SnakeGame";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Classic Snake Game Online - EG Zone",
  description: "Play the classic retro Snake game online for free. Eat food to grow your snake, avoid walls, and don't bite your own tail to get a high score.",
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

      {/* SEO Content Section */}
      <div className="mt-20 max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Play Snake</h2>
          <div className="prose text-gray-600">
            <p><strong>Snake</strong> is the classic arcade game where you control a growing serpent. The goal is to eat as much food as possible without crashing into the walls or your own tail.</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Controls:</strong> Use the arrow keys (Up, Down, Left, Right) to direct the snake.</li>
              <li><strong>Eat to Grow:</strong> Guide the snake to the red food block. Each time the snake eats, it grows longer and your score increases.</li>
              <li><strong>Avoid Obstacles:</strong> Do not hit the walls of the game area.</li>
              <li><strong>Watch Your Tail:</strong> As the snake gets longer, navigating becomes harder. If the snake's head touches any part of its body, the game is over.</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Features</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Nostalgic retro gameplay with smooth, modern mechanics.</li>
            <li>Responsive controls optimized for quick reactions.</li>
            <li>Clean, distraction-free interface to keep you focused.</li>
            <li>High score tracking to challenge your friends and yourself.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions (FAQ)</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">How do I get a high score in Snake?</h3>
              <p className="text-gray-600 mt-1">To get a high score, focus on controlling your speed and planning your path. Try to zigzag your snake tightly when it gets very long to save space, and avoid moving blindly towards the edges.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Is this the original Snake game?</h3>
              <p className="text-gray-600 mt-1">This is a modern web-based version inspired by the classic Snake game that became popular on early mobile phones, featuring similar addictive gameplay with updated graphics.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Can I play Snake on my phone?</h3>
              <p className="text-gray-600 mt-1">Yes! Our Snake game is fully responsive and supports touch controls, so you can enjoy playing it on any mobile device directly in your browser.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
