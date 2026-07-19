/* eslint-disable */
import SudokuGame from "@/games/sudoku/SudokuGame";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Sudoku Online Free - Daily Number Puzzle - EG Zone",
  description: "Play free Sudoku online. Train your brain with daily number puzzles. Fill the 9x9 grid so every row, column, and 3x3 box contains digits 1-9.",
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

      {/* SEO Content Section */}
      <div className="mt-20 max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Play Sudoku</h2>
          <div className="prose text-gray-600">
            <p><strong>Sudoku</strong> is a popular logic-based number-placement puzzle. The goal is to fill a 9x9 grid with numbers so that every column, row, and 3x3 subgrid contains all digits from 1 to 9.</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>The Grid:</strong> The game board is a 9x9 grid, divided into nine 3x3 subgrids.</li>
              <li><strong>The Goal:</strong> Fill all empty squares with digits from 1 to 9.</li>
              <li><strong>The Rules:</strong> 
                <ul className="list-circle pl-5 mt-2">
                  <li>Each row must contain the numbers 1-9 exactly once.</li>
                  <li>Each column must contain the numbers 1-9 exactly once.</li>
                  <li>Each 3x3 box must contain the numbers 1-9 exactly once.</li>
                </ul>
              </li>
              <li><strong>No Guessing:</strong> Sudoku requires logic. You don't need to guess; every puzzle has a single unique solution.</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Features</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Clean, user-friendly interface optimized for both desktop and mobile screens.</li>
            <li>Note-taking feature (pencil marks) to help you keep track of possible numbers.</li>
            <li>Error highlighting to quickly spot your mistakes.</li>
            <li>Completely free to play with no downloads required.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions (FAQ)</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Do I need to be good at math to play Sudoku?</h3>
              <p className="text-gray-600 mt-1">Not at all! Sudoku is a game of logic, not arithmetic. The numbers are just symbols; they could easily be replaced with letters, shapes, or colors.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">What is the best strategy for beginners?</h3>
              <p className="text-gray-600 mt-1">Start by looking for rows, columns, or 3x3 boxes that already have a lot of numbers filled in. Use a process of elimination to figure out which numbers are missing and where they must go.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Are all Sudoku puzzles solvable?</h3>
              <p className="text-gray-600 mt-1">Yes, all properly generated Sudoku puzzles have exactly one unique solution that can be found using pure logic, without the need for guessing.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
