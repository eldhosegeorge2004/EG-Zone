import GuessWordGame from "@/games/guessword/GuessWord";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GuessWordPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl mb-8 flex items-center">
        <Link 
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
      <GuessWordGame />
      <div className="w-full">
        <GameSEO 
          gameName="Guess Word"
          description="Guess Word is a brain-teasing vocabulary game similar to popular word-guessing games. You have a limited number of attempts to guess a hidden word."
          howToPlay={[
            "Type a Guess: Use your keyboard to enter a 5-letter word.",
            "Submit: Press Enter to submit your guess.",
            "Check Colors: A green letter means it's correct and in the right spot. A yellow letter means it's in the word but in the wrong spot. Gray means the letter is not in the word.",
            "Win: Guess the correct word before you run out of tries!"
          ]}
          features={[
            "Expands vocabulary and spelling skills",
            "Intuitive color-coded feedback system",
            "Clean, modern user interface",
            "Highly addictive daily puzzle format"
          ]}
          faqs={[
            {
              question: "Is there a time limit in Guess Word?",
              answer: "No, there is no time limit. You can take as much time as you need to think about your next guess."
            },
            {
              question: "What is the best starting word?",
              answer: "Words with many vowels and common consonants are great starters. Popular choices include 'ADIEU', 'CRANE', 'STARE', and 'AUDIO'."
            }
          ]}
        />
      </div>
    </div>
  );
}
