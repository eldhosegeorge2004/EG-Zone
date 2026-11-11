/* eslint-disable */
import Connect4Game from "@/games/connect4/Connect4Game";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Connect 4 Online Free — 2 Player Pass & Play | EG ZONE",
  description: "Play classic Connect 4 (Four in a Row) online with a friend in local two-player mode. Drop colored chips, form lines of 4, and master tactical strategy.",
};

export default function Connect4Page() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Play Connect 4 (2 Players)</h1>
        <p className="text-gray-600 font-medium">Take turns dropping chips and connect four in a row horizontally, vertically, or diagonally to beat your friend.</p>
      </div>

      <Connect4Game />

      <GameSEO 
        gameName="Connect 4"
        description="Connect 4 (also known as Four in a Row, Captain's Mistress, or Four Up) is an iconic two-player connection strategy game first popularized by Milton Bradley in 1974. Played on a 7-column by 6-row vertical grid, two players alternate dropping colored discs into slots, using gravity to build lines while anticipating and blocking their opponent's tactics. EG ZONE brings this timeless classic to your browser with responsive touch support, animated disc placement, and instant local pass-and-play multiplayer."
        howToPlay={[
          "Player Roles: Player 1 controls Red chips and Player 2 controls Yellow chips on the same screen.",
          "Choose a Column: Hover or tap over any of the 7 columns. A drop preview indicator will highlight the exact slot where your chip will land.",
          "Drop Your Disc: Click or tap the column to release your disc. It will drop to the lowest unoccupied slot in that column.",
          "Alternate Turns: Players take turns dropping one disc per turn.",
          "Form 4 in a Row: Connect four of your colored discs in an unbroken line horizontally, vertically, or diagonally.",
          "Block Your Opponent: Watch for enemy three-in-a-row threats and block them before they complete their winning line.",
          "Tie Condition: If all 42 slots on the 7x6 board are filled without any player connecting four discs, the game ends in a tie."
        ]}
        features={[
          "Pass & Play 2-Player mode designed for friends on phones, tablets, or laptops",
          "Live column hover indicators with ghost previews for precision piece placement",
          "Winning line celebration with glowing pulse effects on the four connected discs",
          "Move Undo functionality and complete session win-loss-draw scorekeeping",
          "Fluid responsive design built for both mouse clicks and mobile touch gestures",
          "Zero installs or sign-ups required—play instantly in your web browser"
        ]}
        faqs={[
          {
            question: "How do two players play on the same device?",
            answer: "Player 1 and Player 2 simply take turns clicking or tapping the columns on the screen. The scorekeeper tracks rounds won by Red and Yellow automatically."
          },
          {
            question: "Is there a winning strategy for Connect 4?",
            answer: "Controlling the center column (column 4) gives you the greatest number of winning line combinations. Look for 'double threats' (setting up two separate ways to connect four at once) so your opponent can only block one of them."
          },
          {
            question: "Can moves be undone?",
            answer: "Yes! Click the 'Undo' button in the top bar to take back the last move if a player makes an accidental click."
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
