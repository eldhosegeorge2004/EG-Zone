/* eslint-disable */
import SudokuGame from "@/games/sudoku/SudokuGame";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Sudoku | EG ZONE",
  description: "Fill the 9x9 grid so every row, column, and 3x3 box contains digits 1-9.",
};

export default function SudokuPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Sudoku</h1>
        <p className="text-gray-600 font-medium">Fill the grid so every row, column, and box contains digits 1-9.</p>
      </div>

      <SudokuGame />
    </div>
  );
}
