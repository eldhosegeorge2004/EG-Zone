/* eslint-disable */
import AimTrainer from "@/games/aim/AimTrainer";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Aim Trainer | EG ZONE",
  description: "Click the targets as fast as they appear to improve your mouse accuracy and speed.",
};

export default function AimPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Aim Trainer</h1>
        <p className="text-gray-600 font-medium">Click the targets as fast as they appear.</p>
      </div>

      <AimTrainer />

      <GameSEO 
        gameName="Aim Trainer"
        description="Aim Trainer is a fast-paced reaction game designed to improve your mouse accuracy, hand-eye coordination, and reaction time. Targets will appear on the screen, and you must click them as quickly as possible before they disappear."
        howToPlay={[
          "Start the Game: Click the start button to begin the challenge.",
          "Click Targets: As soon as a target appears on the screen, move your cursor and click it.",
          "Be Fast: The faster you click, the higher your score.",
          "Avoid Misses: Missing a target or clicking outside of it may reduce your score or end the game."
        ]}
        features={[
          "Simple, distraction-free interface",
          "Helps improve hand-eye coordination and reaction time",
          "Perfect warm-up tool for competitive gamers",
          "Track your high scores and progress over time"
        ]}
        faqs={[
          {
            question: "How do I get a high score in Aim Trainer?",
            answer: "Focus on precision first, then speed. It's better to be slightly slower but hit every target accurately rather than rushing and missing frequently."
          },
          {
            question: "Can Aim Trainer help me in other games?",
            answer: "Yes! Many FPS (First-Person Shooter) players use games like this to warm up their wrists and improve their flick shots before jumping into competitive matches."
          }
        ]}
      />
    </div>
  );
}
