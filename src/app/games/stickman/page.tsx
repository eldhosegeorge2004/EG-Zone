"use client";

import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";
import StickmanGame from "@/games/stickman/StickmanGame";

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
        <div className="flex-1 flex flex-col w-full h-full">
          <StickmanGame />
        </div>

      </div>
    </div>
  );
}
