/* eslint-disable */
import QuizGame from "@/games/quiz/QuizGame";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Daily Quiz | EG ZONE",
  description: "Test your general knowledge with a series of challenging trivia questions.",
};

export default function QuizPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Daily Quiz</h1>
        <p className="text-gray-600 font-medium">Test your general knowledge.</p>
      </div>

      <QuizGame />
    </div>
  );
}
