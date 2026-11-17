/* eslint-disable */
import BubbleShooter from "@/games/bubbles/BubbleShooter";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Bubble Shooter Online Free | EG ZONE",
  description: "Aim, match, and pop vibrant spheres in Bubble Shooter! Enjoy captivating puzzle mechanics, satisfying cluster cascades, and progressively challenging arcade stages right in your browser.",
};

export default function BubbleShooterPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/games" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <BubbleShooter />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Bubble Shooter"
            description="Bubble Shooter is a classic color-matching arcade puzzle that delivers endless tactical satisfaction. Align your shooter with precision, bouncing shots off walls to target hard-to-reach clusters of identical bubbles. Clear all clusters before the descending ceiling breaches the danger threshold and climb through ever-escalating levels of puzzle mastery."
            howToPlay={[
              "Aiming: Move your mouse or drag your finger across the game board to orient the dotted trajectory guideline.",
              "Shooting: Click the mouse or tap on touchscreen devices to fire the loaded bubble towards your designated target.",
              "Match 3 to Clear: Connect three or more bubbles of matching color to pop the entire connected cluster and earn bonus points.",
              "Drop Floating Bubbles: Detach supporting bubble clusters from the ceiling to cause all suspended unanchored bubbles to plunge down.",
              "Prevent the Descent: Clear all bubbles to advance to the next level before any sphere crosses the lower danger limit line."
            ]}
            features={[
              "Hexagonal Geometry Grid: Authentic honeycomb bubble arrangement delivering crisp angle calculations and ricochet dynamics.",
              "Trajectory Aiming Aid: Intuitive aiming guides that assist in plotting complex wall bounces and tactical placements.",
              "Cascading Drop Mechanics: Rewarding chain reactions where unmoored bubbles drop into points bonuses.",
              "Progressive Level Scaling: Advancing stages feature varied color palettes and denser cluster patterns for heightened excitement.",
              "Universal Input Support: Smooth, responsive mouse aiming and touchscreen tap-to-shoot gameplay."
            ]}
            faqs={[
              {
                question: "How do I clear bubbles faster in Bubble Shooter?",
                answer: "Look for strategic anchor points near the top of the grid. Popping the root bubble of a large cluster causes all dangling bubbles below it to fall off immediately, scoring huge bonus points."
              },
              {
                question: "Can bubbles bounce off the side walls?",
                answer: "Yes, you can bank your shots off the left and right borders of the canvas to reach high-value clusters hidden behind other bubbles."
              },
              {
                question: "What happens when I clear the entire board?",
                answer: "Clearing all bubbles scores a level victory celebration and unlocks the next stage with expanded bubble colors and layouts."
              },
              {
                question: "What triggers a game over?",
                answer: "If bubbles accumulate and cross the red dashed danger line near the bottom of the play area, the game concludes."
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
