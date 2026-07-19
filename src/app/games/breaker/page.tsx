import BreakerGame from "@/games/breaker/BreakerGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BreakerPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl mb-8 flex items-center">
        <Link 
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
      <BreakerGame />
      <div className="w-full">
        <GameSEO 
          gameName="Brick Breaker"
          description="Brick Breaker is an arcade classic where you control a paddle to bounce a ball and destroy all the bricks on the screen."
          howToPlay={[
            "Move Paddle: Use your mouse or arrow keys to move the paddle left and right.",
            "Bounce the Ball: Keep the ball from falling off the bottom of the screen by bouncing it with your paddle.",
            "Break Bricks: The ball will destroy bricks upon impact. Clear all bricks to win.",
            "Catch Power-ups: Some bricks may drop power-ups that make your paddle wider, add extra balls, or give you lasers."
          ]}
          features={[
            "Classic arcade gameplay with modern physics",
            "Multiple levels of increasing difficulty",
            "Exciting power-ups and power-downs",
            "Clean and responsive graphics"
          ]}
          faqs={[
            {
              question: "How many levels are there in Brick Breaker?",
              answer: "The game features an endless mode where levels get progressively harder and faster as you go."
            },
            {
              question: "What happens if I miss the ball?",
              answer: "If the ball falls past your paddle, you lose a life. If you run out of lives, it's game over."
            }
          ]}
        />
      </div>
    </div>
  );
}
