/* eslint-disable */
import MinesweeperGame from "@/games/minesweeper/MinesweeperGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Minesweeper Online Free | EG ZONE",
  description: "Play classic Minesweeper online with customizable difficulty tiers (Easy, Medium, Hard). Clear the minefield using deduction, flags, and quick logic. 100% free with no downloads.",
};

export default function MinesweeperPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Play Minesweeper</h1>
        <p className="text-gray-600 font-medium">Clear the minefield using deductive logic. Flag suspicious tiles and avoid detonating any hidden bombs.</p>
      </div>

      <MinesweeperGame />

      <GameSEO 
        gameName="Minesweeper"
        description="Minesweeper is one of the most iconic logic and deduction puzzle games of all time, originally popularized in the 1960s and made famous worldwide as a staple of personal computing. The objective is deceptively simple: uncover all non-mine tiles on a checkered grid without triggering any hidden explosives. Each revealed square discloses a number indicating how many mines neighbor that cell, providing the exact numerical clues needed to deduce safe pathways and strategically flag danger zones. EG ZONE brings this retro masterpiece to modern web browsers with mobile touch-friendly controls, responsive grid rendering, and guaranteed first-click safety."
        howToPlay={[
          "Select Difficulty: Choose from Easy (9x9 with 10 mines), Medium (12x12 with 24 mines), or Hard (16x16 with 40 mines) depending on your skill and screen size.",
          "First Click is Always Safe: Click or tap any tile to start. The initial click and all eight surrounding neighbors are guaranteed to never contain a mine.",
          "Read Numerical Clues: Numbers on revealed tiles represent the exact count of mines directly adjacent horizontally, vertically, or diagonally.",
          "Flag Potential Mines: Right-click on desktop, or toggle 'Flag Mode' on mobile phones, to plant a red flag on suspected mine locations.",
          "Cascade Expansion: Opening a tile with zero adjacent mines automatically triggers a safe cascading chain reaction, revealing surrounding safe territory.",
          "Clear the Board to Win: Safely uncover every single non-mine tile to win the game and set a new personal best time."
        ]}
        features={[
          "Guaranteed first-click safety mechanism prevents unfair instant losses",
          "Three classic difficulty presets: Easy (9x9), Medium (12x12), and Hard (16x16)",
          "Mobile-friendly 'Flag Mode' toggle button allowing seamless one-tap flagging on touchscreens",
          "Dynamic retro-modern digital counters tracking remaining mines and elapsed game time",
          "Classic interactive smiley face reset button reflecting suspense, victory, and game-over states",
          "Personal best time leaderboard tracker saved locally in your web browser",
          "Zero installations, intrusive popups, or downloads required—play directly in your browser"
        ]}
        faqs={[
          {
            question: "How do I place flags on mobile phones or tablets?",
            answer: "Simply tap the 'Flag Mode' toggle button above the board. When Flag Mode is active, tapping any unrevealed tile will place or remove a flag rather than uncovering it."
          },
          {
            question: "Can I hit a mine on my very first move?",
            answer: "No! EG ZONE implements an algorithm that ensures your very first click is guaranteed to be 100% safe, along with its surrounding neighboring tiles."
          },
          {
            question: "What do the colored numbers mean?",
            answer: "Each number tells you exactly how many hidden mines are touching that specific square in the 8 neighboring directions (North, South, East, West, and the 4 diagonals)."
          },
          {
            question: "What happens if I accidentally click on a mine?",
            answer: "Clicking a mine triggers a detonation, immediately ending the game and revealing the positions of all remaining hidden mines on the grid. You can press the smiley face button at any time to instantly start a fresh game."
          }
        ]}
      />
    </div>
  );
}
