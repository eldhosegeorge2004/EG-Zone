/* eslint-disable */
import GeoDash from "@/games/geodash/GeoDash";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Geometry Dash Online Free | EG ZONE",
  description: "Jump, fly, and flip your way through dangerous obstacles and rhythmic spikes in Geometry Dash online on EG ZONE.",
};

export default function GeoDashPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/games" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <GeoDash />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Geometry Dash"
            description="Experience the exhilarating thrill of Geometry Dash directly in your web browser. Guide your agile geometric cube through an intense gauntlet of spikes, elevated platforms, and gravity-inverting portals timed to pulsating rhythmic beats. Test your reflexes and reaction speed as each level pushes your timing skills to the absolute limit in this addictive rhythm-platformer."
            howToPlay={[
              "Jump: Press the Spacebar, click, or tap the screen to leap over hazardous spikes.",
              "Hold for Height: Time your jumps accurately to clear elevated platforms safely.",
              "Gravity Inversion: Pass through glowing gravity portals to flip your movement to the ceiling and back.",
              "Avoid Hazards: Any collision with sharp spikes or walls resets your progress to the beginning.",
              "Track Progress: Watch your progress percentage bar climb as you strive for a perfect 100% completion."
            ]}
            features={[
              "High-energy rhythm-based geometric platforming action",
              "Dynamic audio synthesis using native Web Audio API",
              "Interactive gravity-flipping portals and variable platform layouts",
              "Persistent best-percentage tracking with local storage",
              "Responsive design optimized for both desktop keyboards and mobile touchscreens"
            ]}
            faqs={[
              {
                question: "How do I jump in Geometry Dash?",
                answer: "You can jump by pressing the Spacebar on your keyboard, clicking with your mouse, or tapping anywhere on a touch-enabled mobile screen."
              },
              {
                question: "What do the glowing portals do?",
                answer: "Portals invert gravity, flipping your cube upside down so you run along the ceiling. Stepping into another portal returns gravity to normal."
              },
              {
                question: "Can I save my high score progress?",
                answer: "Yes! Your highest completion percentage is automatically recorded and saved in your browser's local storage."
              },
              {
                question: "Is Geometry Dash free to play on EG ZONE?",
                answer: "Absolutely! You can play Geometry Dash directly in your modern web browser completely free without any downloads or installations."
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
