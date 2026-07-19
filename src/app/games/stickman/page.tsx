"use client";

import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";
import StickmanGame from "@/games/stickman/StickmanGame";
import GameSEO from "@/components/GameSEO";

export default function StickmanGamePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col py-6 px-4 font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto relative z-10 flex-1 flex flex-col">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
          <Link 
            href="/"
            className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow-md transition-all self-start sm:self-auto hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
              <Swords className="w-8 h-8 text-red-500" />
              Stickman Fight
            </h1>
            <p className="text-gray-500 font-medium mt-1">Survive the endless waves of stickmen!</p>
          </div>
          
          <div className="w-12 hidden sm:block"></div> {/* Spacer for centering */}
        </div>

        {/* Game Container */}
        <div className="flex-1 flex flex-col w-full h-full mb-10">
          <StickmanGame />
        </div>

        <div className="w-full pb-10">
          <GameSEO 
            gameName="Stickman Fight"
            description="Stickman Fight is a fast-paced action brawler where you control a stick figure martial artist. Your objective is to defeat endless waves of incoming enemies coming from both sides of the screen."
            howToPlay={[
              "Attack Left: Press the left arrow key or click the left side of the screen to attack an enemy on your left.",
              "Attack Right: Press the right arrow key or click the right side of the screen to attack an enemy on your right.",
              "Timing is Key: Only attack when the enemy is within your reach. If you attack too early, you will miss and be left vulnerable.",
              "Survive: Keep defeating enemies to increase your score and survive as long as possible."
            ]}
            features={[
              "Intense, fast-paced combat",
              "Simple two-button control scheme",
              "Satisfying hit animations and effects",
              "Endless survival mode for infinite replayability"
            ]}
            faqs={[
              {
                question: "Why do I keep missing my attacks?",
                answer: "You are likely attacking before the enemy is within your attack range. Wait until the indicator shows they are close enough before striking."
              },
              {
                question: "Is there an end to the game?",
                answer: "No, this is an endless survival game. The goal is simply to achieve the highest score possible before being defeated."
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
