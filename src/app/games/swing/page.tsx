/* eslint-disable */
import SwingGame from "@/games/swing/SwingGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Swing Online Free — Physics Lantern Grapple Arcade | EG ZONE",
  description:
    "Play Swing online for free! Tap to release your pendulum swing, soar across celestial lanterns, collect sparkling gems, and master momentum physics.",
};

export default function SwingPage() {
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 pb-12">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/games"
          className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Games
        </Link>
        <div className="text-right">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Swing
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Master pendulum momentum, grab lanterns by the core, and collect gems
          </p>
        </div>
      </div>

      <SwingGame />

      <div className="mt-12">
        <GameSEO
          gameName="Swing"
          description="Swing is a physics-driven arcade flyer set across an enchanting midnight sky. Attached to glowing celestial lanterns by an energy tether, you orbit in smooth circular trajectories. Tap the screen or hit the spacebar to release your hold and launch through the air. Gravity curves your flight until you pass within range of the next lantern, automatically shooting a fresh tether. Snagging lanterns close to their golden core triggers 'Perfect' combo multipliers that boost your score, while sparkling pink gems floating between anchors reward bonus points."
          howToPlay={[
            "Build Angular Momentum: While orbiting an anchor, your speed steadily increases. Watch the direction and arc of your rotation.",
            "Tap or Spacebar to Release: Release your hold at the apex of your swing to convert rotational energy into forward and upward velocity.",
            "Automatic Latch: As you glide through the dark sky, coming within range of any illuminated lantern automatically latches a new tether.",
            "Aim for the Center: Grappling a lantern near its core (within 30 pixels) triggers a 'Perfect' combo, increasing your streak and awarding massive bonus points.",
            "Collect Floating Gems: Swoop through sparkling pink diamond gems scattered along your flight path for +5 bonus points each.",
            "Beware of the Void: Plummeting off the bottom edge or trailing too far behind the camera results in game over."
          ]}
          features={[
            "Fluid 60FPS pendulum and gravitational projectile physics simulation",
            "Procedural lantern generation featuring vertical floating and bobbing dynamics",
            "Satisfying risk-reward 'Perfect' combo system with escalating audio chimes",
            "Atmospheric twilight aesthetic with parallax starfields and glowing firefly particles",
            "Responsive one-touch / Spacebar control scheme optimized for PC and mobile devices",
            "Tactile haptic vibration triggers on collisions and gem pickups",
            "Persistent high-score distance tracker to challenge your record across sessions"
          ]}
          faqs={[
            {
              question: "When is the best moment to let go in Swing?",
              answer:
                "Release when your tether points roughly 45 degrees backward and upward relative to your forward trajectory. This maximizes both horizontal distance and lift, ensuring you clear wide gaps to the next lantern."
            },
            {
              question: "What causes the lantern to break or miss?",
              answer:
                "If you let go too late and fly downward at steep angles, you may pass beneath the reach radius of the next lantern and fall into the void. Maintain steady upward momentum."
            },
            {
              question: "Do lanterns start moving as my score increases?",
              answer:
                "Yes! Beyond score 120, certain lanterns gently oscillate up and down with sine-wave motion, requiring extra precision and timing adjustments."
            },
            {
              question: "Is Swing compatible with mobile touch controls?",
              answer:
                "Absolutely! Tapping anywhere on your touchscreen releases and hooks instantly, offering an intuitive one-thumb arcade experience on phones and tablets."
            }
          ]}
        />
      </div>
    </div>
  );
}
