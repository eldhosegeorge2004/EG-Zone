/* eslint-disable */
import Nonogram from "@/games/nonogram/Nonogram";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Nonogram (Picross) Online Free | EG ZONE",
  description: "Play Nonogram (Picross) online for free. Solve Japanese paint-by-number logic puzzles with numbered clues, timer, and pixel art reveals on EG ZONE.",
};

export default function NonogramPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/games" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <Nonogram />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Nonogram"
            description="Immerse yourself in Nonogram, also universally celebrated as Picross, Griddlers, and Japanese paint-by-numbers. Use pure deductive reasoning to decode numerical clues along every row and column to uncover delightful hidden pixel art pictures. Whether you are tackling cozy 5x5 starter puzzles or intricate 10x10 challenges, Nonogram provides a deeply satisfying blend of calm logic and mental exercise right in your browser."
            howToPlay={[
              "Read the Clues: Numbers along each row and column indicate consecutive blocks of filled squares in that line.",
              "Mind the Gaps: Multiple numbers (e.g., '3 1') mean there must be at least one empty square separating consecutive filled groups.",
              "Fill Cells: Left-click or tap with the 'Fill' tool active to color in squares you know must be filled.",
              "Mark Known Empties: Right-click or use the 'Mark X' tool to cross out squares that definitely cannot be filled.",
              "Verify and Reveal: Complete the entire logic grid accurately to trigger the pixel art win animation and record your best speed."
            ]}
            features={[
              "Collection of handcrafted pixel art puzzles spanning 5x5 and 10x10 grid sizes",
              "Dual input modes: easy left/right click controls and dedicated mobile touch toggle buttons",
              "Optional error checker to help guide and educate beginning puzzle solvers",
              "Built-in stopwatch tracking best completion times saved in local browser storage",
              "Dynamic Web Audio API synthesized sound effects enhancing every logical move"
            ]}
            faqs={[
              {
                question: "What does a clue like '2 3' mean in Nonogram?",
                answer: "It means the line contains a consecutive group of 2 filled squares followed by at least one empty square, and then a consecutive group of 3 filled squares in that order."
              },
              {
                question: "How do I mark empty cells on a mobile phone?",
                answer: "Use the 'Mark X' mode button located directly above the puzzle grid to switch your taps to place crosses instead of fills."
              },
              {
                question: "Can Nonogram puzzles be solved without guessing?",
                answer: "Yes! All authentic Nonogram puzzles are designed to be solved purely through deductive logic without any random guessing."
              },
              {
                question: "Is Nonogram free to play on EG ZONE?",
                answer: "Yes, Nonogram is completely free to play online with no downloads, subscriptions, or installations required."
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
