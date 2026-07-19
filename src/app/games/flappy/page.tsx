import FlappyGame from "@/games/flappy/FlappyGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FlappyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg mb-8 flex items-center">
        <Link 
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
      <FlappyGame />
      <div className="w-full">
        <GameSEO 
          gameName="Flappy Bird"
          description="Test your timing and patience in this notoriously difficult arcade game. Navigate a small bird through a series of endless pipes without crashing."
          howToPlay={[
            "Fly: Tap the screen, click your mouse, or press the spacebar to make the bird flap its wings and fly upward.",
            "Navigate: Guide the bird through the gaps between the green pipes.",
            "Don't Crash: If you touch a pipe or hit the ground, the game is over.",
            "Score Points: You earn one point for every set of pipes you successfully pass through."
          ]}
          features={[
            "Simple one-touch controls",
            "Highly addictive and challenging gameplay",
            "Retro-inspired pixel art aesthetics",
            "Compete for the highest score"
          ]}
          faqs={[
            {
              question: "Why is Flappy Bird so hard?",
              answer: "The game relies heavily on precise timing and quick reflexes. The bird falls quickly, so you must maintain a steady rhythm to keep it aloft and navigate the narrow gaps."
            },
            {
              question: "What is a good score in Flappy Bird?",
              answer: "Anything above 10 is considered decent for a beginner. Reaching a score of 50 or above requires intense focus and practice!"
            }
          ]}
        />
      </div>
    </div>
  );
}
