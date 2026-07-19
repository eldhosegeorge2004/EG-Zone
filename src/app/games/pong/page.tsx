import PongGame from "@/games/pong/PongGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PongPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl mb-8 flex items-center">
        <Link 
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
      <PongGame />
      <div className="w-full">
        <GameSEO 
          gameName="Pong"
          description="Pong is one of the earliest arcade video games. It is a table tennis sports game featuring simple two-dimensional graphics where you compete against a computer opponent."
          howToPlay={[
            "Control Paddle: Use your mouse or arrow keys to move your paddle up and down.",
            "Hit the Ball: Block the ball from passing your paddle to send it back to the opponent.",
            "Score Points: You earn a point if the computer fails to return the ball.",
            "Win: The first player to reach a set number of points wins the match."
          ]}
          features={[
            "Classic 1970s retro gameplay",
            "Adjustable AI difficulty (Easy, Medium, Hard)",
            "Responsive and smooth paddle mechanics",
            "Perfect for a quick nostalgic gaming session"
          ]}
          faqs={[
            {
              question: "When was Pong originally released?",
              answer: "Pong was originally released by Atari in 1972 and became the first commercially successful video game."
            },
            {
              question: "How do I beat the hard AI?",
              answer: "The AI tracks the ball's movement perfectly. To beat it, you need to hit the ball with the edge of your paddle to increase its speed and bounce angle, making it harder for the AI to reach in time."
            }
          ]}
        />
      </div>
    </div>
  );
}
