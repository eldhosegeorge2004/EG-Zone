/* eslint-disable */
import Crossword from "@/games/crossword/Crossword";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Crossword Lite Online Free | EG ZONE",
  description: "Challenge your vocabulary and problem-solving skills with Crossword Lite online. Solve engaging 10x10 crossword puzzles with interactive clues, timers, and hints on EG ZONE.",
};

export default function CrosswordPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/games" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <Crossword />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Crossword Lite"
            description="Exercise your mind with Crossword Lite, an elegant and accessible word puzzle game designed for puzzle lovers of all skill levels. Explore carefully constructed 10x10 grids packed with clever across and down word intersections covering nature, technology, science, and everyday life. With instant answer checking, built-in hint assistance, and seamless touch controls, Crossword Lite delivers the perfect daily mental workout directly in your browser."
            howToPlay={[
              "Select a Cell: Click or tap any numbered white square in the 10x10 grid to start entering letters.",
              "Switch Direction: Click the selected square again or tap any clue in the panel to toggle between Across and Down orientation.",
              "Type Your Answers: Use your physical keyboard or the on-screen keypad to fill in your guesses.",
              "Check Your Accuracy: Press the 'Check Answers' button to verify your entries with green indicating correct letters and red highlighting mistakes.",
              "Use Helpful Hints: If you get stuck on a difficult clue, tap 'Reveal Letter' to uncover the correct character in the highlighted cell."
            ]}
            features={[
              "Multiple handcrafted 10x10 crossword grids with balanced themes",
              "Interactive clue sidebar with automatic synchronization to selected cells",
              "Integrated on-screen mobile keyboard designed for responsive touch play",
              "Web Audio API sound synthesis providing satisfying auditory feedback",
              "High score and completion time tracking saved locally in your browser"
            ]}
            faqs={[
              {
                question: "How do I switch between Across and Down clues?",
                answer: "Simply click or tap on the active square a second time, press the arrow keys on your keyboard, or click directly on any clue in the clue list."
              },
              {
                question: "Do hints decrease my final score?",
                answer: "Yes, using the 'Reveal Letter' hint deducts points from your total puzzle score, encouraging you to solve as many words independently as possible."
              },
              {
                question: "Can I play Crossword Lite on my smartphone or tablet?",
                answer: "Yes! Crossword Lite features a built-in virtual touch keypad and responsive design, making it seamless to play on any modern mobile device."
              },
              {
                question: "Is Crossword Lite free to play on EG ZONE?",
                answer: "Crossword Lite is 100% free with unlimited access to all included crossword puzzles without any subscription or downloads."
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
