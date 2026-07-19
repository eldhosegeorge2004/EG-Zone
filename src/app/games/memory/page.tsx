/* eslint-disable */
import MemoryGame from "@/games/memory/MemoryGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Memory Match | GameHub",
  description: "Test your memory and match the cards in the fewest moves possible.",
};

export default function MemoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Memory Match</h1>
        <p className="text-gray-600 font-medium">Flip the cards and find all matching pairs.</p>
      </div>

      <MemoryGame />

      <GameSEO 
        gameName="Memory Match"
        description="Memory Match is a classic card game that trains your short-term memory and concentration. Flip cards to reveal images and remember their locations to find matching pairs."
        howToPlay={[
          "Flip Cards: Click on any two face-down cards to reveal them.",
          "Find Pairs: Try to find two cards with the exact same image.",
          "Match: If they match, they will remain face up.",
          "Mismatch: If they don't match, they will flip back over after a short delay.",
          "Win: The game ends when all pairs have been successfully matched."
        ]}
        features={[
          "Helps improve short-term memory and focus",
          "Clean, visually appealing interface",
          "Tracks your moves and time to measure improvement",
          "Relaxing yet mentally stimulating gameplay"
        ]}
        faqs={[
          {
            question: "Why is memory matching good for the brain?",
            answer: "Memory games require active recall and spatial awareness, which can help strengthen neural pathways and improve overall cognitive function and focus."
          },
          {
            question: "How is the score calculated?",
            answer: "Your final score is usually based on how few moves (flips) it took you to complete the board, as well as how quickly you finished."
          }
        ]}
      />
    </div>
  );
}
