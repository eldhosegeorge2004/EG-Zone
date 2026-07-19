import ColorMatchGame from "@/games/colormatch/ColorMatch";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ColorMatchPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg mb-8 flex items-center">
        <Link 
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
      <ColorMatchGame />
      <div className="w-full">
        <GameSEO 
          gameName="Color Match"
          description="Color Match is a fast-paced cognitive game that tests your brain's ability to process conflicting information. You must match the word's meaning, not the color of its text."
          howToPlay={[
            "Read the Word: Look at the word presented on the screen.",
            "Ignore the Color: Do not pay attention to the color the word is written in.",
            "Select the Meaning: Click the button that corresponds to the meaning of the word.",
            "Act Quickly: You have a limited time to make the correct choice before the timer runs out."
          ]}
          features={[
            "Tests and improves cognitive flexibility (Stroop Effect)",
            "Fast-paced and challenging gameplay",
            "Simple interface focused on mental processing speed",
            "Great brain training exercise"
          ]}
          faqs={[
            {
              question: "What is the Stroop Effect?",
              answer: "The Stroop Effect is a demonstration of interference in the reaction time of a task. When the name of a color is printed in a color not denoted by the name, naming the color of the word takes longer and is more prone to errors."
            },
            {
              question: "How does this game help my brain?",
              answer: "By forcing your brain to suppress its initial instinct (reading the color) and instead focus on the meaning, you train your cognitive control and executive functioning skills."
            }
          ]}
        />
      </div>
    </div>
  );
}
