/* eslint-disable */
import Platformer from "@/games/platform/Platformer";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play 2D Platformer Online Free | EG ZONE",
  description:
    "Play classic 2D Platformer action adventure online free on EG ZONE. Run, double jump across challenging gaps, stomp menacing patrol bots, and collect shiny gold coins!",
};

export default function PlatformerPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <Platformer />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="2D Platformer"
            description="Embark on an endless side-scrolling platforming adventure loaded with acrobatic jumps, shiny collectibles, and dangerous robotic patrols. Leap across floating platforms suspended in the dusk skyline, timing your leaps carefully to clear perilous chasms. Master the mid-air double jump to reach elevated ledges and crush patrolling adversaries beneath your boots. Every meter traversed and coin gathered bolsters your score in this tribute to retro jump-and-run classics."
            howToPlay={[
              "Move Horizontally: Use Left and Right Arrow keys or the A and D keys to run smoothly across platforms.",
              "Leap and Double Jump: Tap Up Arrow, W, or Spacebar to jump; press it again while airborne to execute an agile double jump.",
              "Defeat Patrol Bots: Drop onto patrolling mechanical enemies from above to stomp them out of existence and earn bonus points.",
              "Harvest Gold Coins: Leap into suspended gold coins scattered throughout platforms to multiply your expedition score.",
              "Avoid Lethal Hazards: Steer clear of falling into bottomless voids or colliding with enemies from the sides or underneath.",
            ]}
            features={[
              "Fluid character physics engine offering responsive run velocity and mid-air double jumps",
              "Procedurally generated platform sequences ensuring every adventure provides unique terrain",
              "Dynamic side-scrolling camera system keeping the hero seamlessly centered in the action",
              "Challenging patrol robot enemies with custom collision detection and stomp mechanics",
              "Crisp retro sound effects generated instantaneously through browser Web Audio synthesis",
              "Persistent local best score system tracking your farthest distance and collected treasure",
            ]}
            faqs={[
              {
                question: "How do I perform a double jump?",
                answer:
                  "Press the jump key (Up Arrow, W, or Spacebar) a second time while your character is still airborne to launch higher into the sky.",
              },
              {
                question: "Can I play this platformer on mobile or touch devices?",
                answer:
                  "Yes, the game features an intuitive virtual touch scheme where touching the lower left/right screen moves your hero and touching the upper area triggers jumps.",
              },
              {
                question: "How is the total score calculated?",
                answer:
                  "Your score combines the horizontal distance traveled in meters with extra bonus points earned for collecting coins and eliminating robotic enemies.",
              },
              {
                question: "What happens when my character loses a life?",
                answer:
                  "When you take damage or tumble down a chasm, you respawn on the closest stable terrain with temporary invincibility, preserving your accumulated distance until all three hearts are lost.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
