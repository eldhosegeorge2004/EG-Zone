/* eslint-disable */
import SubwayRunner from "@/games/subway/SubwayRunner";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Subway Runner Online Free — Endless 3D Parkour | EG ZONE",
  description: "Play Subway Runner online for free! Dodge speeding trains, jump over hurdles, and slide under barriers across endless 3-lane subway tracks. Play instantly in your web browser.",
};

export default function SubwayRunnerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Subway Runner</h1>
        <p className="text-gray-600 font-medium">Sprint down the 3-lane subway tracks, dodge speeding metro trains, leap over hurdles, and grab gold coins.</p>
      </div>

      <SubwayRunner />

      <GameSEO 
        gameName="Subway Runner"
        description="Subway Runner is a high-octane 3D endless parkour game inspired by world-famous arcade runners like Subway Surfers and Temple Run. Set on an exhilarating metropolitan railway, your goal is to sprint as far as humanly possible down three parallel tracks while dodging onrushing express trains, leaping over low railway hurdles, and ducking underneath low-clearance overhead warning beams. As your distance increases, your speed accelerates, demanding lightning-quick reflexes, sharp spatial awareness, and decisive lane switches. EG ZONE delivers this heart-pounding arcade experience directly in your desktop or mobile browser with zero latency, fluid 60FPS canvas graphics, and seamless touch swipe support."
        howToPlay={[
          "Lane Switching: Use the Left and Right arrow keys (or swipe Left/Right on touchscreens) to switch between the 3 railway tracks.",
          "Jumping: Press the Up Arrow or Spacebar (or swipe Up) to leap into the air and clear low hurdles and track obstacles.",
          "Sliding & Ducking: Press the Down Arrow (or swipe Down) to slide underneath overhead warning signs and low-hanging steel beams.",
          "Avoid Trains: Massive oncoming metro trains cannot be jumped over or slid under—you must steer into an open lane before impact.",
          "Collect Gold Coins: Gather spinning golden coins scattered along the tracks to multiply your final score.",
          "Master the Speed Curve: The further you run, the faster the tracks move. Keep your eyes on the horizon to anticipate double-obstacle combinations."
        ]}
        features={[
          "High-speed 60FPS pseudo-3D perspective engine with smooth camera projection",
          "Intuitive multi-platform controls: Keyboard arrows, touch swipe gestures, and dedicated on-screen mobile buttons",
          "Dynamic obstacle variety: Leapable hurdles, slide-under warning beams, and massive solid express trains",
          "Golden coin collection system with score multipliers and progressive speed scaling",
          "High score leaderboard tracking saved locally in your web browser",
          "Instant restart button to jump right back into the action after a collision",
          "Zero downloads, sign-ups, or installations—play 100% free right in your browser"
        ]}
        faqs={[
          {
            question: "How do I control the runner on a mobile phone or tablet?",
            answer: "You can control your runner by swiping your finger anywhere on the screen (swipe Left/Right to change lanes, swipe Up to jump, and swipe Down to slide). You can also use the convenient on-screen directional touch buttons located right below the canvas."
          },
          {
            question: "Can I jump over oncoming trains?",
            answer: "No! Metro trains are towering solid obstacles that block an entire lane. You must switch to a clear adjacent track to avoid crashing into them."
          },
          {
            question: "How is the total score calculated?",
            answer: "Your final score is the sum of your total distance traveled down the tracks plus 10 bonus points for every golden coin collected."
          },
          {
            question: "Does the game get faster the longer I play?",
            answer: "Yes! Subway Runner features continuous progressive difficulty. Your speed gradually ramps up the further you travel, creating an intense test of concentration and reflexes."
          }
        ]}
      />
    </div>
  );
}
