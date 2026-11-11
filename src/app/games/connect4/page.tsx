/* eslint-disable */
import Connect4Game from "@/games/connect4/Connect4Game";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Connect 4 Online Free | EG ZONE",
  description: "Play classic Connect 4 (Four in a Row) online against smart computer AI or challenge a friend in local two-player mode. Drop chips, form lines of 4, and master tactical strategy.",
};

export default function Connect4Page() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Play Connect 4</h1>
        <p className="text-gray-600 font-medium">Drop your chips and connect four in a row horizontally, vertically, or diagonally before your opponent.</p>
      </div>

      <Connect4Game />

      <GameSEO 
        gameName="Connect 4"
        description="Connect 4 (also known as Four in a Row, Captain's Mistress, or Four Up) is an iconic two-player connection strategy game first popularized by Milton Bradley in 1974. Played on a 7-column by 6-row vertical grid, players alternate dropping colored discs into the slots, using gravity to build lines while anticipating and blocking their opponent's tactics. EG ZONE brings this timeless classic to your browser with responsive touch support, intelligent AI difficulty tiers, and instant local pass-and-play multiplayer."
        howToPlay={[
          "Select Game Mode: Choose 'vs Computer' to play against our adaptive AI engine (Easy, Medium, Hard), or pick '2 Players' for local pass-and-play matches with a friend on the same device.",
          "Choose a Column: Hover or tap over any of the 7 columns. A drop preview indicator will show you the exact slot where your chip will land.",
          "Drop Your Disc: Click or tap the column to release your disc. It will fall to the lowest unoccupied slot in that column.",
          "Alternate Turns: Player 1 plays Red chips and Player 2 (or the AI) plays Yellow chips.",
          "Form 4 in a Row: Connect four of your colored discs in an unbroken line horizontally (across a row), vertically (stacked in a column), or diagonally.",
          "Block Your Opponent: Watch for enemy three-in-a-row threats and block them before they complete their winning line.",
          "Tie Condition: If all 42 slots on the 7x6 board are filled without any player connecting four discs, the game ends in a tie."
        ]}
        features={[
          "Adaptive Computer AI with Easy, Medium, and Hard difficulty levels powered by minimax heuristics",
          "Pass & Play 2-Player mode for side-by-side challenges on phones, tablets, or laptops",
          "Live column hover indicators with ghost previews for precision piece placement",
          "Winning line celebration with glowing pulse effects on the four connected discs",
          "Move Undo functionality and complete session win-loss-draw scorekeeping",
          "Fluid responsive design built for both mouse clicks and mobile touch gestures",
          "Zero installs or sign-ups required—play instantly in your web browser"
        ]}
        faqs={[
          {
            question: "Can I play Connect 4 against another person on the same device?",
            answer: "Yes! Switch the mode toggle at the top of the board to '2 Players'. Players take turns tapping their desired columns on the same phone, tablet, or computer."
          },
          {
            question: "Is there a winning strategy for Connect 4?",
            answer: "Controlling the center column (column 4) gives you the greatest number of winning line combinations. Look for 'double threats' (setting up two separate ways to connect four at once) so your opponent can only block one of them."
          },
          {
            question: "How do the computer difficulty levels work?",
            answer: "Easy makes casual moves suitable for young players and beginners. Medium checks for immediate wins and blocks obvious three-in-a-row traps. Hard uses minimax algorithms with alpha-beta pruning to look multiple turns ahead and formulate positional traps."
          },
          {
            question: "Can games end in a tie in Connect 4?",
            answer: "Yes, if all 42 slots on the 7x6 grid are filled and neither player has achieved four discs in a row, the match concludes as a draw."
          }
        ]}
      />
    </div>
  );
}
