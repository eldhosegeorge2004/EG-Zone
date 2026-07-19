/* eslint-disable */
import QuizGame from "@/games/quiz/QuizGame";
import GameSEO from "@/components/GameSEO";
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

      <GameSEO 
        gameName="Daily Quiz"
        description="The Daily Quiz is a trivia game that tests your knowledge across various subjects including history, science, pop culture, and geography. See how many you can get right!"
        howToPlay={[
          "Read the Question: A trivia question will be presented to you.",
          "Choose Wisely: Select the correct answer from the four available options.",
          "Check Accuracy: The game will immediately tell you if you were correct or incorrect.",
          "Complete the Quiz: Answer all the questions in the set to receive your final score."
        ]}
        features={[
          "Hundreds of unique trivia questions",
          "Covers a wide variety of topics and difficulty levels",
          "Great way to learn new facts every day",
          "Share your score with friends"
        ]}
        faqs={[
          {
            question: "Are the questions different every day?",
            answer: "Yes! The quiz pulls from a large database of questions so you can play frequently without seeing the same questions too often."
          },
          {
            question: "Is there a time limit per question?",
            answer: "Some quiz modes have a timer to add an extra layer of challenge, while others let you think as long as you want."
          }
        ]}
      />
    </div>
  );
}
