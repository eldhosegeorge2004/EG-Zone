/* eslint-disable */
import WordScramble from "@/games/scramble/WordScramble";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Word Scramble | EG ZONE",
  description: "Unscramble the letters to find the hidden word before time runs out.",
};

export default function ScramblePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Word Scramble</h1>
        <p className="text-gray-600 font-medium">Unscramble the letters to find the hidden word.</p>
      </div>

      <WordScramble />

      <GameSEO 
        gameName="Word Scramble"
        description="Word Scramble is a classic anagram word puzzle game. You are given a jumbled set of letters and must rearrange them to form a valid word before the timer runs out."
        howToPlay={[
          "Observe the Letters: A set of mixed-up letters will appear.",
          "Rearrange: Click or type the letters in the correct order to spell a word.",
          "Submit: If your word is valid and uses all the letters, you win the round.",
          "Use Hints: If you are stuck, you can sometimes use a hint to reveal the first letter or get a clue."
        ]}
        features={[
          "Expands vocabulary and spelling skills",
          "Multiple difficulty levels based on word length",
          "Time-based challenges to test your speed",
          "Fun for all ages"
        ]}
        faqs={[
          {
            question: "What happens if I run out of time?",
            answer: "If the timer runs out before you find the word, the round is over and the correct word will be revealed."
          },
          {
            question: "Are there multiple valid answers?",
            answer: "Usually, the game is looking for one specific word, but in some versions, finding any valid word that uses all the letters is accepted."
          }
        ]}
      />
    </div>
  );
}
