/* eslint-disable */
import SpaceInvaders from "@/games/invaders/SpaceInvaders";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Space Invaders Online Free | EG ZONE",
  description:
    "Play Space Invaders retro arcade shooter online free on EG ZONE. Defend Earth against relentless alien armadas, take cover behind defensive bunkers, and destroy mystery UFOs!",
};

export default function SpaceInvadersPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <SpaceInvaders />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Space Invaders"
            description="Relive the golden era of arcade gaming with this authentic and fast-paced Space Invaders tribute. Pilot your star defender along the planetary defense line, intercepting disciplined waves of marching alien invaders descending from deep space. Use defensive shield bunkers strategically as physical cover against incoming laser salvos while returning fire with calculated precision. Keep a watchful eye out for mysterious mothership UFOs speeding across the cosmos for massive bonus bounties."
            howToPlay={[
              "Steer Your Ship: Use the Left and Right Arrow keys or A/D keys (or touch the left/right sides of the canvas) to maneuver your cannon across the defense baseline.",
              "Fire Primary Cannons: Press Spacebar or the Up Arrow key (or tap your touch screen) to launch anti-orbital laser bolts.",
              "Take Bunker Cover: Utilize the four destructible defensive bunkers to absorb incoming alien projectile fire before taking aimed counter-shots.",
              "Eliminate the Armada: Destroy every enemy invader across the five tactical attack rows to advance to progressively faster invasion waves.",
              "Intercept Mystery UFOs: Target the high-altitude flying saucer that occasionally crosses the top of the screen to score an enormous 500-point bounty.",
            ]}
            features={[
              "Faithful arcade mechanics with 5 distinct ranks of animated alien invaders",
              "Dynamic procedural shields that erode and degrade destructively under laser impacts",
              "Bonus flying saucer encounters awarding substantial extra points",
              "Retro-styled audio synthesized in real time via the Web Audio API",
              "Adaptive difficulty that accelerates alien cadence and fire rate as ranks diminish",
              "Local high score recording to challenge your enduring arcade supremacy",
            ]}
            faqs={[
              {
                question: "Do the aliens move faster as their numbers dwindle?",
                answer:
                  "Yes, just like the classic arcade original, the marching speed and march sound cadence accelerate noticeably as fewer aliens remain on the battlefield.",
              },
              {
                question: "Can alien fire destroy my defensive barriers?",
                answer:
                  "Both alien projectiles and your own lasers gradually chip away at and vaporize individual blocks of the four protective shield structures.",
              },
              {
                question: "How do I play Space Invaders on mobile touchscreens?",
                answer:
                  "Tap or drag on the left half of the game canvas to glide left, the right half to glide right, and tap anywhere to discharge your lasers.",
              },
              {
                question: "What triggers a Game Over?",
                answer:
                  "Losing all 3 pilot lives to enemy fire or allowing the advancing alien formation to descend completely to ground level results in game over.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
