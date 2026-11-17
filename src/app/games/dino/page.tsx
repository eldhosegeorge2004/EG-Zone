/* eslint-disable */
import DinoJump from "@/games/dino/DinoJump";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Dino Jump Online Free | EG ZONE",
  description: "Dash and leap over prehistoric obstacles in Dino Jump! An addictive arcade runner featuring dynamic day and night cycles, double jumping mechanics, and retro endless running action.",
};

export default function DinoJumpPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/games" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <DinoJump />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Dino Jump"
            description="Dino Jump is an exhilarating endless runner where quick reflexes and timing are your greatest allies. Guide your intrepid pixel dinosaur across vast prehistoric deserts, dodging perilous cacti and ducking under soaring pterodactyls. As the desert sun sets and starry night sky emerges, the speed ramps up, challenging even the most seasoned arcade enthusiasts to beat their personal best."
            howToPlay={[
              "Jump: Press the Spacebar, Up Arrow, or tap your mobile screen to perform a jump over cacti.",
              "Double Jump: Press the jump key a second time while airborne to leap even higher over tall obstacles.",
              "Duck: Hold the Down Arrow key or drag downward on mobile screens to crouch low under high-flying pterodactyls.",
              "Survival Speed: Stay alive as the dinosaur accelerates progressively over distance, rewarding keen anticipation.",
              "Aim for High Scores: Each step and obstacle safely traversed adds to your score tally, saved automatically to your browser."
            ]}
            features={[
              "Fluid Endless Running: Non-stop side-scrolling action with procedurally generated cacti and flying hazards.",
              "Double Jump Ability: Added agility allowing players to navigate complex obstacle placements with ease.",
              "Day and Night Transitions: Atmospheric visual shift between bright desert sunlight and glowing midnight skies.",
              "Synthesized Sound Effects: Custom retro Web Audio sound effects providing tactile audio feedback without external downloads.",
              "Responsive Touch & Keyboard: Seamless controls across desktop keyboards and mobile touchscreen devices."
            ]}
            faqs={[
              {
                question: "How do I avoid pterodactyls in Dino Jump?",
                answer: "Pterodactyls can glide at various altitudes. When flying high, you can run right under them or duck using the Down Arrow (or swipe down on mobile). When flying low, jump or double jump to clear them."
              },
              {
                question: "Does the game get faster as I play?",
                answer: "Yes, Dino Jump gradually accelerates as your score increases, testing your reflexes and split-second decision making."
              },
              {
                question: "Can I play Dino Jump on mobile phones and tablets?",
                answer: "Absolutely. Dino Jump features comprehensive mobile touch gestures including single-tap jumping and downward swipe ducking."
              },
              {
                question: "Is my high score saved when I leave the page?",
                answer: "Yes, your personal best score is persisted automatically in your local storage so you can track your progress over time."
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
