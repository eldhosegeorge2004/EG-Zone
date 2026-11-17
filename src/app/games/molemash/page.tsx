/* eslint-disable */
import dynamic from "next/dynamic";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const MoleMash = dynamic(() => import("@/games/molemash/MoleMash"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-64 bg-gray-900 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading Mole Mash...</p>
      </div>
    </div>
  ),
});

export const metadata = {
  title: "Play Mole Mash Online Free — Whack-a-Mole Arcade Game | EG ZONE",
  description:
    "Mole Mash is a free whack-a-mole arcade game with 5 unique mole types, combo multipliers, 3 difficulty modes, and power-ups. Smash moles, dodge bomb beavers, and beat your high score!",
};

export default function MoleMashPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <Link
          href="/games"
          className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
      </div>

      <MoleMash />

      <div className="max-w-4xl mx-auto px-4 mt-8 pb-16 text-slate-900">
        <GameSEO
          gameName="Mole Mash"
          description="Mole Mash is a fast-paced whack-a-mole arcade game with a colourful cast of characters bursting out of holes in the ground. Race against the clock to smash as many moles as possible, chain combos for bonus points, and steer clear of the bomb-laden beaver that will cost you 10 points. With three difficulty modes, special golden and icy moles, star power-ups, and a local high-score tracker, every 30-second round feels fresh and competitive. The smooth animations, satisfying hammer swing, and cheerful art make it equally enjoyable on desktop and mobile."
          howToPlay={[
            "Tap or click any mole that pops out of a hole to whack it and earn points — regular brown moles are worth +1 each.",
            "Build a combo by whacking multiple moles without missing. 3+ hits in a row display your combo streak for bonus bragging rights.",
            "Avoid the Bomb Beaver (💣) — it costs you 10 points if you hit it, so let it retreat safely.",
            "Golden Moles (👑) are rare and worth +5 points each — prioritise them when they appear.",
            "Ice Moles (❄️) freeze the countdown timer for a few seconds, giving you precious extra time to rack up points.",
            "Star Moles (✨) grant a Double Points power-up for a short burst — hammer everything in sight while it lasts.",
            "Choose Easy, Normal, or Hard mode before the game starts. Hard mode has faster mole cycles and a higher frequency of tricky specials.",
            "Your best score for each difficulty is saved locally in your browser — try to beat it every session!",
          ]}
          features={[
            "5 unique mole/character types: standard mole, golden mole (+5), ice mole (time freeze), star mole (x2 points), and bomb beaver (−10).",
            "3 difficulty modes — Easy, Normal, and Hard — each with distinct spawn speeds and power-up probabilities.",
            "Combo streak system: chain consecutive hits to light up your combo counter and impress your friends.",
            "Power-up system: Double Points and Time Freeze add strategic depth to every round.",
            "Persistent high-score tracking per difficulty mode using localStorage — your best score survives page reloads.",
            "Custom SVG mole art with smooth pop-up animations, squash-on-hit effects, and floating score popups.",
            "Animated sky-and-grass background with drifting clouds for a cheerful, polished aesthetic.",
            "Full mobile support — all interactions are tap-friendly with touch-action manipulation and no accidental zoom.",
            "Pause and mute controls built into the HUD so you can step away mid-game without losing your run.",
            "No download, no login — just open and play instantly in any modern browser.",
          ]}
          faqs={[
            {
              question: "How do I score the most points in Mole Mash?",
              answer:
                "Prioritise Golden Moles (+5) whenever they appear, activate Star Mole Double Points and hammer everything during the buff, and avoid hitting Bomb Beavers (−10). Building a combo streak by hitting multiple moles rapidly also maximises your score per second.",
            },
            {
              question: "What happens if I hit the Bomb Beaver?",
              answer:
                "Hitting a Bomb Beaver (the grey beaver holding a bomb) deducts 10 points from your score. Let it disappear back into its hole safely — it's always better to skip it than risk losing points.",
            },
            {
              question: "What does the Ice Mole do?",
              answer:
                "The Ice Mole (❄️) freezes the game timer for a few seconds when whacked. The timer bar turns blue to indicate freeze mode. This gives you extra time to score more hits.",
            },
            {
              question: "What is the Star Mole power-up?",
              answer:
                "The Star Mole (✨) activates a Double Points buff for a short duration. All points earned during this window are doubled — a great time to spam hits and maximise your score.",
            },
            {
              question: "Does the game save my high score?",
              answer:
                "Yes! Your best score for each difficulty mode (Easy, Normal, Hard) is saved in your browser's localStorage and displayed in the HUD. It persists between sessions as long as you don't clear your browser data.",
            },
            {
              question: "Is Mole Mash mobile-friendly?",
              answer:
                "Absolutely. The game is fully tap-based and responsive, designed to work on phones and tablets with no accidental zooming or scrolling. The holes are sized for comfortable finger tapping on small screens.",
            },
          ]}
        />
      </div>
    </div>
  );
}
