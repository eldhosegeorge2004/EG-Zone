/* eslint-disable */
import BiggerArea from "@/games/biggerarea/BiggerArea";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Bigger Area Online Free — Fast Geometry Math Game | EG ZONE",
  description:
    "Play Bigger Area online for free! Compare rectangles, triangles, circles, parallelograms, and trapezoids in 45 seconds and pick the larger area.",
};

export default function BiggerAreaPage() {
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
            Bigger Area
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Compare geometric shapes and pick the larger area fast!
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-3 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <BiggerArea />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Bigger Area"
          description="Bigger Area is a fast-paced mental math and geometry challenge. Two shapes appear side by side with their dimensions labeled — rectangles, squares, triangles, circles, parallelograms, and trapezoids. Because the drawings are not to scale, you must calculate and compare their true areas before the 45-second clock runs out!"
          howToPlay={[
            "Read the dimensions under both shapes carefully (shapes are not drawn to scale).",
            "Tap the left or right card (or press Left / Right Arrow keys) to pick the shape with the larger area.",
            "Correct answers earn +1 point; wrong answers cost 1 point.",
            "Score as many correct comparisons as possible within 45 seconds.",
          ]}
          features={[
            "6 shape types: rectangles, squares, triangles, circles, parallelograms, and trapezoids.",
            "Keyboard arrow key support as well as tap/click controls.",
            "Daily seeded challenge and Random practice mode.",
            "45-second sprint format ideal for sharpening mental arithmetic.",
          ]}
          faqs={[
            {
              question: "What area formulas are used in Bigger Area?",
              answer:
                "Rectangle = width × height, Square = side², Triangle = (base × height) / 2, Circle = 3.14 × radius², Parallelogram = base × height, and Trapezoid = ((sideA + sideB) / 2) × height.",
            },
            {
              question: "Can two shapes have nearly identical areas?",
              answer:
                "The generator ensures at least a 15% difference between the two areas so every pair has a clear winner.",
            },
          ]}
        />
      </div>
    </div>
  );
}
