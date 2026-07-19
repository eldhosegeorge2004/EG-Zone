/* eslint-disable */
import ReactionGame from "@/games/reaction/ReactionGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Reaction Time Test | GameHub",
  description: "Test your reflexes and find out how fast you can react.",
};

export default function ReactionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Reaction Time Test</h1>
        <p className="text-gray-600 font-medium">How fast are your reflexes? Click as soon as the color changes.</p>
      </div>

      <ReactionGame />

      <GameSEO 
        gameName="Reaction Time Test"
        description="The Reaction Time Test is a simple but effective tool used to measure how quickly your brain can process a visual cue and command your hand to respond."
        howToPlay={[
          "Wait: The screen will be red. Wait for it to turn green.",
          "Click: As soon as the screen turns green, click anywhere as fast as you can.",
          "Don't Jump the Gun: If you click while the screen is still red, you will get a penalty.",
          "Average Score: The test will run 5 times and give you an average reaction time in milliseconds."
        ]}
        features={[
          "Measures reaction time down to the millisecond",
          "Calculates an average over 5 attempts for accuracy",
          "Helps gamers track their reflex improvements",
          "Simple, minimalist design"
        ]}
        faqs={[
          {
            question: "What is a good reaction time?",
            answer: "The average human visual reaction time is around 250 milliseconds. Anything under 200ms is considered very fast and common among professional gamers and athletes."
          },
          {
            question: "Does my hardware affect my score?",
            answer: "Yes, your monitor's refresh rate and your mouse's polling rate can add a small amount of latency to your score."
          }
        ]}
      />
    </div>
  );
}
