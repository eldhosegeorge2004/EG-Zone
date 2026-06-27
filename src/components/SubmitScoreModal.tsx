"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, Loader2, CheckCircle2 } from "lucide-react";

interface SubmitScoreModalProps {
  isOpen: boolean;
  score: number;
  gameId: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function SubmitScoreModal({ isOpen, score, gameId, onClose, onSubmitted }: SubmitScoreModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('scores')
        .insert([
          { 
            game_id: gameId, 
            player_name: name.trim().substring(0, 20), // Max 20 chars
            score: score 
          }
        ]);

      if (dbError) throw dbError;

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName("");
        onSubmitted?.();
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error("Failed to submit score:", err);
      setError(err.message || "Failed to submit score. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10" />

        <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mb-4 shadow-inner border border-yellow-200/50">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>

          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">New High Score!</h3>
          <p className="text-gray-500 font-medium mb-6">
            You scored <span className="text-indigo-600 font-bold text-lg">{score}</span> points.
          </p>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
              <p className="font-bold text-emerald-600">Score Saved!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-center font-bold text-lg rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                  required
                />
              </div>
              
              {error && (
                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full flex justify-center items-center bg-gray-900 text-white rounded-xl font-bold p-3.5 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gray-900/10 active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit to Leaderboard"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-gray-500 font-bold p-2 text-sm hover:text-gray-700 transition-colors mt-2"
              >
                Skip for now
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
