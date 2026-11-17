/* eslint-disable */
import CookieClicker from "@/games/cookie/CookieClicker";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Cookie Clicker Online Free | EG ZONE",
  description:
    "Play the addictive Cookie Clicker idle game online for free. Click the giant cookie, recruit helpers, unlock industrial bakeries, accumulate massive passive CPS, and prestige your empire.",
};

export default function CookieClickerPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <CookieClicker />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Cookie Clicker"
            description="Cookie Clicker is the premier incremental idle game where your journey starts with a single tap on a giant chocolate chip cookie. As your stash grows, invest in automatic cursors, dedicated grandmas, cookie farms, underground dough mines, and mystical wizard towers to generate billions of cookies per second. Watch numbers scale into millions, billions, and trillions while unlocking coveted achievements. Reach the pinnacle of baking supremacy and trigger prestige resets for eternal glory."
            howToPlay={[
              "Click the Cookie: Tap the giant golden cookie to harvest individual cookies and build your starting capital.",
              "Purchase Upgrades: Spend your cookies in the shop to purchase passive income producers like Cursors, Grandmas, and Factories.",
              "Optimize Production: Balance quick returns from low-tier upgrades with long-term compounding CPS from high-tier facilities.",
              "Collect Achievements: Hit milestone thresholds from First Cookie up to Trillionaire status to fill your trophy shelf.",
              "Prestige Reset: Once you hit astronomical earnings, initiate a prestige reset to elevate your master ranking.",
            ]}
            features={[
              "Endless Idle Progression: Cookies continue generating continuously with automatic per-second calculations.",
              "8 Unique Production Buildings: Upgrade from humble Cursors and Grandmas up to automated Factories, Banks, and Wizard Towers.",
              "Milestone Achievement System: Unlock distinct visual badge achievements celebrating baking production records.",
              "Automatic Game Saving: Game state, upgrade tiers, and total cookies baked persist automatically in local browser storage.",
              "Floating Hit Text & Sound Effects: Delightful sound synthesis and animated floating cookie gains provide satisfying feedback.",
            ]}
            faqs={[
              {
                question: "Do cookies continue to bake if I switch browser tabs?",
                answer:
                  "Yes, the idle loop keeps computing your cookies-per-second income and saves progress periodically to localStorage.",
              },
              {
                question: "What does CPS mean in Cookie Clicker?",
                answer:
                  "CPS stands for 'Cookies Per Second' and denotes your passive cookie income produced automatically by your hired helpers and buildings.",
              },
              {
                question: "How do I trigger Prestige mode?",
                answer:
                  "When your lifetime earned cookies surpass one billion, the Prestige Reset button unlocks, allowing you to reset with prestige stars.",
              },
              {
                question: "Is any software installation required?",
                answer:
                  "No installation or download is necessary. Cookie Clicker plays entirely within modern web browsers on desktop, tablet, and mobile.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
