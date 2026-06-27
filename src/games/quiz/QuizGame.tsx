/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { Play, RotateCcw, Trophy, HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

export type Question = {
  q: string;
  options: string[];
  answer: number;
};

import { QUIZ_QUESTIONS } from "./questions";

export default function QuizGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("quizBestScore");
    if (saved) setBestScore(parseInt(saved));
  }, []);

  const startGame = () => {
    // Shuffle the massive dataset and pick 10 questions
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setSelectedAnswer(null);
    setShowSubmitModal(false);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    
    const isCorrect = index === questions[currentIdx].answer;
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(c => c + 1);
        setSelectedAnswer(null);
      } else {
        setIsPlaying(false);
        setIsGameOver(true);
        setShowSubmitModal(true);
        const finalScore = score + (isCorrect ? 1 : 0);
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          localStorage.setItem("quizBestScore", finalScore.toString());
        }
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[600px] flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Score</span>
          <span className="text-3xl font-black text-gray-900 leading-none mt-1">{score} / {questions.length || 5}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center">
            <Trophy className="w-3 h-3 mr-1 text-amber-500" /> Best
          </span>
          <span className="text-3xl font-black text-amber-500 leading-none mt-1">
            {bestScore}
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-[600px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl min-h-[400px] w-full flex flex-col items-center justify-center">
          
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-pink-100">
                <HelpCircle className="w-10 h-10 text-pink-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Daily Quiz</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Test your general knowledge with 10 random trivia questions from our massive database of 1000+!
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Start Quiz
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                <Trophy className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Quiz Complete!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                You scored <span className="font-black text-pink-600 text-xl">{score}</span> out of 10.
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          {isPlaying && questions.length > 0 && (
            <div className="w-full h-full flex flex-col">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <span className="text-sm font-bold text-gray-400">Question {currentIdx + 1} of {questions.length}</span>
                <div className="flex gap-1 sm:gap-1 flex-wrap">
                  {questions.map((_, i) => (
                    <div key={i} className={`w-5 sm:w-8 h-2 rounded-full ${i === currentIdx ? 'bg-pink-500' : i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 leading-tight">
                {questions[currentIdx].q}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                {questions[currentIdx].options.map((opt, i) => {
                  let btnClass = "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300";
                  let Icon = null;
                  
                  if (selectedAnswer !== null) {
                    if (i === questions[currentIdx].answer) {
                      btnClass = "bg-green-50 border-green-500 text-green-700 font-bold";
                      Icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
                    } else if (i === selectedAnswer) {
                      btnClass = "bg-red-50 border-red-500 text-red-700";
                      Icon = <XCircle className="w-5 h-5 text-red-500" />;
                    } else {
                      btnClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedAnswer !== null}
                      className={`relative flex items-center justify-between p-4 rounded-xl border-2 text-left font-semibold transition-all duration-200 ${btnClass}`}
                    >
                      <span>{opt}</span>
                      {Icon}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score + (selectedAnswer === questions[currentIdx]?.answer && currentIdx === questions.length - 1 ? 1 : 0)}
        gameId="quiz"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
