"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GAMES } from "@/lib/games";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Trophy, Medal, Crown, Loader2, Gamepad2 } from "lucide-react";

type ScoreEntry = {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
};

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<string>(GAMES[0].slug);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('game_id', selectedGame)
          .order('score', { ascending: false }) // highest first
          .limit(10);

        if (error) {
          console.error("Error fetching scores:", error);
          setScores([]);
        } else {
          setScores(data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScores();
  }, [selectedGame]);

  const activeGame = GAMES.find(g => g.slug === selectedGame) || GAMES[0];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4 font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
          <Link 
            href="/"
            className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow-md transition-all self-start sm:self-auto hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-4">
              <Trophy className="w-10 h-10 text-amber-500" />
              Global Leaderboards
            </h1>
            <p className="text-gray-500 font-medium mt-2">See how you stack up against the best players in the world.</p>
          </div>
          
          <div className="w-12 hidden sm:block"></div> {/* Spacer for centering */}
        </div>

        {/* Game Selector */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 sm:pb-0 sm:flex-wrap sm:justify-center">
            {GAMES.map(game => {
              const isSelected = selectedGame === game.slug;
              return (
                <button
                  key={game.slug}
                  onClick={() => setSelectedGame(game.slug)}
                  className={`
                    flex-shrink-0 flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300
                    ${isSelected 
                      ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10 scale-105' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/50'}
                  `}
                >
                  <Gamepad2 className={`w-4 h-4 mr-2 ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`} />
                  {game.title}
                </button>
              )
            })}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[400px]">
          
          {/* Header */}
          <div className={`p-8 bg-gradient-to-r ${activeGame.color} text-white flex justify-between items-center`}>
            <div>
              <h2 className="text-2xl font-black">{activeGame.title} Rankings</h2>
              <p className="opacity-80 text-sm font-medium mt-1">Top 10 Players globally</p>
            </div>
            <Link 
              href={`/games/${activeGame.slug}`}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-full font-bold text-sm backdrop-blur-md transition-all shadow-sm flex items-center"
            >
              Play Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 pt-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold animate-pulse">Fetching global records...</p>
              </div>
            ) : scores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <Trophy className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No scores yet!</h3>
                <p className="text-gray-500 max-w-sm">Be the first to set a high score in {activeGame.title} and claim the #1 spot.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 w-20 text-center">Rank</th>
                      <th className="p-4">Player</th>
                      <th className="p-4 text-right">Score</th>
                      <th className="p-4 text-right hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score, idx) => {
                      const isFirst = idx === 0;
                      const isSecond = idx === 1;
                      const isThird = idx === 2;

                      return (
                        <tr 
                          key={score.id} 
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center">
                              {isFirst && <Crown className="w-6 h-6 text-yellow-500 drop-shadow-md" />}
                              {isSecond && <Medal className="w-6 h-6 text-gray-400" />}
                              {isThird && <Medal className="w-6 h-6 text-amber-700" />}
                              {!isFirst && !isSecond && !isThird && (
                                <span className="text-gray-400 font-bold text-sm">#{idx + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`font-bold text-base ${isFirst ? 'text-gray-900 text-lg' : 'text-gray-700'}`}>
                              {score.player_name}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`font-black tracking-tight ${isFirst ? 'text-indigo-600 text-xl' : 'text-gray-900 text-lg'}`}>
                              {score.score.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4 text-right text-gray-400 text-sm font-medium hidden sm:table-cell">
                            {new Date(score.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
