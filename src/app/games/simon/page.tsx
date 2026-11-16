/* eslint-disable */
import SimonSays from "@/games/simon/SimonSays";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Simon Says Online Free — Memory Sequence Game | EG ZONE",
  description: "Play classic Simon Says online for free! Watch the illuminated colors flash, memorize the audio-visual sound sequence, and repeat the pattern to level up.",
};

export default function SimonPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/games" 
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>

        {/* Game Main Component */}
        <SimonSays />

        {/* AdSense SEO Component */}
        <div className="mt-16 text-slate-900">
          <GameSEO 
            gameName="Simon Says"
            description="Simon Says is the legendary electronic memory and pattern-matching game that has trained brains and challenged reflexes for generations. Featuring four vibrant quadrant buttons—green, red, yellow, and blue—each corresponding to a distinct harmonic tone, the game generates an ever-expanding sequence of lights and sounds. Your objective is simple yet demanding: watch the glowing lights, listen to the acoustic pitches, remember the exact sequence, and tap each color quadrant back in precise order. With each successful round completed, Simon adds one more step to the chain, pushing your short-term working memory and concentration to their absolute limits. Play Simon Says completely free on EG ZONE with crystal-clear synthesized audio and zero lag on desktop, mobile, and tablets."
            howToPlay={[
              "Start the Round: Press the blue 'START GAME' button to initiate the first round.",
              "Watch and Listen: Simon illuminates one or more color pads in a specific sequence, accompanied by unique synthesized musical tones.",
              "Repeat the Pattern: When 'Your turn!' appears, tap the corresponding colored pads (Green, Red, Yellow, Blue) in the identical order shown.",
              "Level Progression: Successfully repeating the entire sequence advances you to the next level, where Simon repeats the pattern and adds one new color to the end.",
              "One Mistake Ends the Run: A single incorrect color tap will immediately end the game, recording your score and updating your personal best high score."
            ]}
            features={[
              "Faithful recreation of the classic four-color circular electronic memory game",
              "Harmonic Web Audio tones calibrated to distinct frequencies for intuitive audio-visual pattern learning",
              "Dynamic level progression that tracks consecutive sequences and pushes your memory limits",
              "Persistent local high score saving stored securely directly inside your browser",
              "Responsive circular layout optimized for touchscreen taps and desktop mouse clicks",
              "Fast instant restart for quick replay loops and daily brain training"
            ]}
            faqs={[
              {
                question: "How does playing Simon Says improve memory and brain performance?",
                answer: "Simon Says directly stimulates your working memory and audio-visual cognitive processing. By associating visual colors with musical frequencies and sequentially rehearsing them, your brain exercises neural plasticity, focus, and rapid information retention."
              },
              {
                question: "What are the sound frequencies used in the game?",
                answer: "The game features four distinct musical frequencies: Green (329.63 Hz - E4), Red (261.63 Hz - C4), Yellow (392.00 Hz - G4), and Blue (523.25 Hz - C5). This harmonic spacing helps auditory learners memorize patterns by melody as well as by sight."
              },
              {
                question: "Is there a maximum level limit?",
                answer: "No! The game is completely endless. The sequence will continue growing by one color every round for as long as your memory can keep up."
              },
              {
                question: "Can I play Simon Says on a smartphone without downloading an app?",
                answer: "Yes! Simon Says runs natively in your mobile browser with full touch gesture support and optimized sound playback."
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}