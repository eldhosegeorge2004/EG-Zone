/* eslint-disable */
import TypingGame from "@/games/typing/TypingGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Typing Speed Test | GameHub",
  description: "Test and improve your typing speed and accuracy.",
};

export default function TypingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Typing Speed Test</h1>
        <p className="text-gray-600 font-medium">How fast can you type? Test your WPM and accuracy.</p>
      </div>

      <TypingGame />

      <GameSEO 
        gameName="Typing Speed Test"
        description="The Typing Speed Test helps you measure and improve your typing speed (Words Per Minute) and accuracy. It's a great tool for students, professionals, or anyone looking to become a faster typist."
        howToPlay={[
          "Start Typing: Begin typing the highlighted words you see on the screen.",
          "Keep Rhythm: Try to maintain a steady rhythm without looking at your keyboard.",
          "Fix Mistakes: If you make a mistake, the word will usually highlight red. Use backspace to correct it if required.",
          "Check Results: When the time is up, your WPM (Words Per Minute) and accuracy percentage will be displayed."
        ]}
        features={[
          "Accurate WPM calculation algorithm",
          "Real-time visual feedback on errors",
          "Various text modes (random words, sentences, punctuation)",
          "Great for improving productivity and coding speed"
        ]}
        faqs={[
          {
            question: "What is a good typing speed?",
            answer: "The average typing speed is around 40 WPM. Professional typists usually range from 65 to 90 WPM, and advanced typists can exceed 120 WPM."
          },
          {
            question: "How can I improve my typing speed?",
            answer: "The best way to improve is through touch-typing (typing without looking at the keys) and consistent daily practice focusing on accuracy first, then speed."
          }
        ]}
      />
    </div>
  );
}
