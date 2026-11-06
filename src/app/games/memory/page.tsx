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
        description="Memory Match is a classic card game that trains your short-term memory and concentration. Play solo or challenge friends in local 2 to 4 player multiplayer mode on the same device! Flip cards to reveal vehicles and remember their locations to find matching pairs."
        howToPlay={[
          "Choose Mode: Select Solo (1 Player) or 2–4 Players using the player toggle at the top.",
          "Flip Cards: On your turn, click on any two face-down cards to reveal them.",
          "Find Pairs: If the two cards match, you claim the pair, score a point, and get an extra turn!",
          "Mismatch: If they don't match, they flip back and the turn passes to the next player.",
          "Win: The game ends when all pairs are matched. In multiplayer, the player with the most pairs wins!"
        ]}
        features={[
          "Local 2 to 4 player pass-and-play multiplayer mode",
          "Color-coded player scoreboards and turn indicators",
          "Solo mode with move tracking and global leaderboard",
          "Smooth 3D flip card animations and clean design"
        ]}
        faqs={[
          {
            question: "How does 2-4 player multiplayer work?",
            answer: "Players take turns on the same screen flipping two cards. If a player finds a matching pair, they score 1 point and earn an extra turn. If they miss, the turn passes to the next player. The player with the most pairs at the end wins!"
          },
          {
            question: "Why is memory matching good for the brain?",
            answer: "Memory games require active recall and spatial awareness, which can help strengthen neural pathways and improve overall cognitive function and focus."
          },
          {
            question: "How is the solo score calculated?",
            answer: "Your final score in solo mode is based on how few moves it took you to complete the board, which can then be submitted to the global leaderboard."
          }
        ]}
      />
    </div>
  );
}
