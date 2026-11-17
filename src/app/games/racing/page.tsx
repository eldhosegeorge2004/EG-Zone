/* eslint-disable */
import CarRacingGame from "@/games/racing/CarRacingGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Highway Car Racing Online Free — 3D Turbo Racer | EG ZONE",
  description: "Play Highway Car Racing online for free! Weave through dense multi-lane traffic, unleash nitro turbo boosts, perform near misses, and race supercars. No download required.",
};

export default function HighwayRacerPage() {
  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 pb-12">
      {/* Compact Top Navigation Bar */}
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/games"
          className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Games
        </Link>
        <div className="text-right">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Highway Car Racer
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Dodge traffic, hit nitro boosts, and perform close near misses
          </p>
        </div>
      </div>

      {/* Main Game Screen */}
      <CarRacingGame />

      {/* AdSense SEO Component */}
      <div className="mt-12">
        <GameSEO
          gameName="Highway Car Racer"
          description="Highway Car Racer is an adrenaline-fueled 3D arcade traffic racing game where speed, precision steering, and split-second reflexes determine your survival. Taking inspiration from iconic driving titles such as Traffic Racer and OutRun, you sit behind the wheel of a high-performance sports car hurtling down a crowded 4-lane expressway. Weave between sedans, semi-trailer trucks, sports coupes, and police cruisers while maintaining peak velocity. Activating your nitrous oxide booster catapults your vehicle past 210 km/h with blazing exhaust flames and dynamic motion blur. To keep players engaged and reward daring maneuvers, closely overtaking adjacent traffic without crashing triggers high-multiplier Near Miss bonuses that supercharge your score."
          howToPlay={[
            "Steering: Use Left and Right Arrow keys or A / D (or tap the Left/Right on-screen buttons on mobile) to smoothly steer between the 4 highway lanes.",
            "Acceleration & Nitro Boost: Press Up Arrow, W, or Spacebar (or hold the NITRO / GAS button on mobile) to throttle your engine and unleash nitrous oxide for extreme speeds over 200 km/h.",
            "Braking & Slowing Down: Press Down Arrow or S (or tap the BRAKE button) to decelerate quickly and squeeze safely behind slower vehicles when lanes are blocked.",
            "Near Miss Multipliers: Pass traffic vehicles within inches at high speeds (>95 km/h) to earn instant Near Miss bonus points and refill your nitro reserves.",
            "Collect Road Pickups: Grab spinning gold coins for score boosts, blue N2O canisters to instantly max out your nitro tank, purple magnets to draw coins automatically, and protective shield orbs.",
            "Free Armor Cushion: Every run comes equipped with 1 Free Collision Shield, absorbing your first crash impact so your race isn't cut short by early mistakes."
          ]}
          features={[
            "High-performance 60FPS pseudo-3D highway engine with responsive vehicle physics and smooth lane transitions",
            "Dynamic AI traffic system featuring diverse vehicles: sedans, delivery pickups, heavy semi-trailers, sports cars, and police cruisers",
            "Procedural traffic behavior with realistic turn signals, lane-changing AI, and illuminated brake lights",
            "Nitro turbo booster system with custom exhaust flame particles, high-speed camera shake, and motion blur streaks",
            "Satisfying Near Miss risk-reward system with combo score multipliers and nitro replenishment",
            "Atmospheric lighting engine cycling seamlessly between Daylight, Sunset, and Cyberpunk Neon Night driving",
            "Accessible across all devices with responsive keyboard controls and dedicated on-screen mobile touch buttons",
            "Persistent local high score and distance record tracking"
          ]}
          faqs={[
            {
              question: "How do I activate the Nitro Boost?",
              answer: "On desktop keyboards, hold the Up Arrow key, W, or Spacebar. On mobile devices or tablets, press and hold the 'NITRO / GAS' touch button located directly below the canvas. Nitro boosts your top speed from 140 km/h up to 215 km/h!"
            },
            {
              question: "What is a 'Near Miss' and how does it benefit me?",
              answer: "A Near Miss happens when you overtake another vehicle with very narrow horizontal clearance while driving faster than 95 km/h. Successfully pulling off a near miss rewards 100+ bonus score points and refills a chunk of your nitro gauge."
            },
            {
              question: "What happens if I crash into another vehicle?",
              answer: "Your car starts with 1 Free Shield / Armor buffer. Your first collision will break the shield and grant 2 seconds of invulnerability instead of ending your game. If you crash again without armor, your run concludes and your stats are tallied."
            },
            {
              question: "Can I play Highway Car Racer on my smartphone without a keyboard?",
              answer: "Yes! The game features full touchscreen support with dedicated ergonomic Left, Right, Brake, and Nitro buttons placed below the canvas for comfortable two-thumb mobile gaming."
            },
            {
              question: "Do traffic cars change lanes unexpectedly?",
              answer: "Yes! Certain AI drivers will flash their yellow turn signals and switch lanes. Keep your eyes focused far ahead on the road so you can anticipate lane changes before impact."
            }
          ]}
        />
      </div>
    </div>
  );
}
