/* eslint-disable */
import MathChallenge from "@/games/math/MathChallenge";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Math Challenge | EG ZONE",
  description: "Solve arithmetic problems as quickly as possible.",
};

export default function MathPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Math Challenge</h1>
        <p className="text-gray-600 font-medium">Solve arithmetic problems as quickly as possible.</p>
      </div>

      <MathChallenge />

      <GameSEO 
        gameName="Math Challenge"
        description="Math Challenge is an educational and fast-paced game that tests your mental arithmetic. Solve a rapid-fire series of math problems before the timer expires."
        howToPlay={[
          "Look at the Equation: An arithmetic problem will appear on the screen.",
          "Calculate: Solve the problem in your head as quickly as possible.",
          "Select Answer: Click or tap the correct answer from the multiple choices provided.",
          "Beat the Clock: Answer as many questions as you can before the time runs out."
        ]}
        features={[
          "Covers addition, subtraction, multiplication, and division",
          "Great for students and adults wanting to keep their brain sharp",
          "Dynamic difficulty that adapts to your performance",
          "Fun and competitive educational tool"
        ]}
        faqs={[
          {
            question: "Is Math Challenge suitable for children?",
            answer: "Yes, it is an excellent tool for children to practice basic arithmetic in a fun, gamified environment that encourages quick thinking."
          },
          {
            question: "How can I improve my score?",
            answer: "Practice daily! Mental math is a skill that improves significantly with consistent repetition and familiarity with number patterns."
          }
        ]}
      />
    </div>
  );
}
