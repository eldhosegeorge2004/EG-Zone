/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

type MoleType = "normal" | "golden" | "bomb";

interface Hole {
  id: number;
  active: boolean;
  moleType: MoleType;
  animOut: boolean;
}

const GRID_SIZE = 9; // 3x3
const GAME_DURATION = 60;

function playWhackSound(type: MoleType) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "bomb") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "golden") {
      [880, 1100, 1320].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.1);
        o.start(ctx.currentTime + i * 0.06);
        o.stop(ctx.currentTime + i * 0.06 + 0.1);
      });
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {}
}

function playMissSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

function playStartSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume();
    [523, 659, 784].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = f;
      g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
      o.start(ctx.currentTime + i * 0.1);
      o.stop(ctx.currentTime + i * 0.1 + 0.15);
    });
  } catch {}
}

interface HitEffect {
  id: number;
  holeId: number;
  text: string;
  color: string;
}

export default function WhackMole() {
  const [holes, setHoles] = useState<Hole[]>(
    Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      active: false,
      moleType: "normal",
      animOut: false,
    }))
  );
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [highScore, setHighScore] = useState(0);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [misses, setMisses] = useState(0);

  const scoreRef = useRef(score);
  const gameStateRef = useRef(gameState);
  const hitEffectIdRef = useRef(0);
  const moleTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  scoreRef.current = score;
  gameStateRef.current = gameState;

  useEffect(() => {
    try {
      const hs = localStorage.getItem("whackmole_hs");
      if (hs) setHighScore(parseInt(hs));
    } catch {}
  }, []);

  function getMoleVisibleTime(): number {
    const s = scoreRef.current;
    if (s >= 30) return 500;
    if (s >= 20) return 700;
    if (s >= 10) return 900;
    return 1200;
  }

  function getSpawnInterval(): number {
    const s = scoreRef.current;
    if (s >= 30) return 400;
    if (s >= 20) return 600;
    if (s >= 10) return 800;
    return 1000;
  }

  function pickMoleType(): MoleType {
    const r = Math.random();
    if (r < 0.08) return "golden";
    if (r < 0.15) return "bomb";
    return "normal";
  }

  function spawnMole() {
    if (gameStateRef.current !== "playing") return;

    setHoles((prev) => {
      const inactiveIds = prev.filter((h) => !h.active && !h.animOut).map((h) => h.id);
      if (inactiveIds.length === 0) return prev;
      const idx = inactiveIds[Math.floor(Math.random() * inactiveIds.length)];
      const moleType = pickMoleType();
      const next = prev.map((h) =>
        h.id === idx ? { ...h, active: true, moleType, animOut: false } : h
      );

      // Auto-hide mole after visible time
      const visTime = getMoleVisibleTime();
      const timer = setTimeout(() => {
        if (gameStateRef.current !== "playing") return;
        setHoles((p) => {
          const h = p.find((x) => x.id === idx);
          if (h && h.active && !h.animOut) {
            // Mole escaped
            if (h.moleType !== "bomb") {
              setMisses((m) => m + 1);
              playMissSound();
            }
            return p.map((x) =>
              x.id === idx ? { ...x, active: false, animOut: false } : x
            );
          }
          return p;
        });
      }, visTime);
      moleTimersRef.current.set(idx, timer);
      return next;
    });
  }

  // Game timer
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft((tl) => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, timeLeft]);

  // Spawn loop
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      spawnMole();
    }, getSpawnInterval());
    return () => clearInterval(interval);
  }, [gameState, score]);

  function startGame() {
    playStartSound();
    // Clear all timers
    moleTimersRef.current.forEach((t) => clearTimeout(t));
    moleTimersRef.current.clear();
    setHoles(Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      active: false,
      moleType: "normal",
      animOut: false,
    })));
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setHitEffects([]);
    setGameState("playing");
  }

  function endGame() {
    setGameState("over");
    moleTimersRef.current.forEach((t) => clearTimeout(t));
    moleTimersRef.current.clear();
    setHoles((p) => p.map((h) => ({ ...h, active: false, animOut: false })));
    const finalScore = scoreRef.current;
    setHighScore((hs) => {
      if (finalScore > hs) {
        try { localStorage.setItem("whackmole_hs", finalScore.toString()); } catch {}
        return finalScore;
      }
      return hs;
    });
  }

  function handleWhack(holeId: number, e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (gameState !== "playing") return;
    const hole = holes.find((h) => h.id === holeId);
    if (!hole || !hole.active || hole.animOut) return;

    // Clear auto-hide timer
    const timer = moleTimersRef.current.get(holeId);
    if (timer) {
      clearTimeout(timer);
      moleTimersRef.current.delete(holeId);
    }

    playWhackSound(hole.moleType);

    let pointsDelta = 0;
    let effectText = "";
    let effectColor = "#22c55e";

    if (hole.moleType === "bomb") {
      pointsDelta = -5;
      effectText = "-5 💥";
      effectColor = "#ef4444";
    } else if (hole.moleType === "golden") {
      pointsDelta = 5;
      effectText = "+5 ⭐";
      effectColor = "#fbbf24";
    } else {
      pointsDelta = 1;
      effectText = "+1";
      effectColor = "#22c55e";
    }

    const newScore = Math.max(0, scoreRef.current + pointsDelta);
    setScore(newScore);
    scoreRef.current = newScore;

    const efId = hitEffectIdRef.current++;
    setHitEffects((prev) => [...prev, { id: efId, holeId, text: effectText, color: effectColor }]);
    setTimeout(() => setHitEffects((prev) => prev.filter((e) => e.id !== efId)), 700);

    setHoles((prev) =>
      prev.map((h) => (h.id === holeId ? { ...h, active: false, animOut: false } : h))
    );
  }

  const timerPercent = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#f59e0b" : "#22c55e";

  const MOLE_EMOJIS: Record<MoleType, string> = {
    normal: "🐭",
    golden: "⭐",
    bomb: "💣",
  };

  const HOLE_COLORS: Record<MoleType, string> = {
    normal: "#78350f",
    golden: "#92400e",
    bomb: "#1c1917",
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4 select-none">
      <h1 className="text-3xl font-bold text-white tracking-tight">🔨 Whack-a-Mole</h1>

      {/* Stats bar */}
      <div className="flex gap-6 items-center">
        <div className="text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider">Score</div>
          <div className="text-3xl font-black text-white">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider">Best</div>
          <div className="text-2xl font-bold text-lime-400">{highScore}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider">Misses</div>
          <div className="text-2xl font-bold text-red-400">{misses}</div>
        </div>
        {gameState === "playing" && (
          <div className="text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wider">Time</div>
            <div className="text-3xl font-black" style={{ color: timerColor }}>{timeLeft}s</div>
          </div>
        )}
      </div>

      {/* Timer bar */}
      {gameState === "playing" && (
        <div className="w-full max-w-sm h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPercent}%`, background: timerColor }}
          />
        </div>
      )}

      {/* Game area */}
      <div className="relative">
        {/* Grid */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", padding: "16px" }}
        >
          {holes.map((hole) => {
            const effect = hitEffects.find((e) => e.holeId === hole.id);
            return (
              <div key={hole.id} className="relative" style={{ width: 100, height: 100 }}>
                {/* Hole */}
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse at center, #292524 0%, #1c1917 60%, #0c0a09 100%)",
                    border: "3px solid #44403c",
                    boxShadow: "inset 0 8px 20px rgba(0,0,0,0.8)",
                    position: "relative",
                    overflow: "hidden",
                    cursor: hole.active ? "pointer" : "default",
                  }}
                  onClick={(e) => hole.active && handleWhack(hole.id, e)}
                  onTouchStart={(e) => hole.active && handleWhack(hole.id, e)}
                >
                  {/* Mole */}
                  {hole.active && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: hole.moleType === "golden" ? 52 : hole.moleType === "bomb" ? 44 : 48,
                        lineHeight: 1,
                        animation: "molePopUp 0.15s ease-out forwards",
                        userSelect: "none",
                        filter: hole.moleType === "golden" ? "drop-shadow(0 0 8px gold)" : "none",
                      }}
                    >
                      {MOLE_EMOJIS[hole.moleType]}
                    </div>
                  )}
                </div>
                {/* Hit effect */}
                {effect && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: effect.color,
                      fontWeight: 900,
                      fontSize: 20,
                      pointerEvents: "none",
                      animation: "floatUp 0.7s ease-out forwards",
                      zIndex: 10,
                      textShadow: "0 0 8px currentColor",
                    }}
                  >
                    {effect.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {gameState !== "idle" && (
        <div className="flex gap-4 text-sm text-slate-400">
          <span>🐭 +1pt</span>
          <span>⭐ +5pts</span>
          <span>💣 -5pts</span>
        </div>
      )}

      {/* Start/Game Over */}
      {gameState === "idle" && (
        <div className="text-center">
          <p className="text-slate-400 mb-4 max-w-sm text-sm">
            Whack the moles before they hide! Golden moles = +5pts. Bomb moles = -5pts. 60 seconds on the clock!
          </p>
          <button
            onClick={startGame}
            className="px-10 py-4 bg-lime-500 hover:bg-lime-400 text-black font-black text-xl rounded-2xl transition-all shadow-lg shadow-lime-500/30 hover:scale-105 active:scale-95"
          >
            🔨 Start Game
          </button>
        </div>
      )}

      {gameState === "over" && (
        <div className="text-center bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700">
          <div className="text-2xl font-black text-white mb-2">⏱️ Time's Up!</div>
          <div className="text-5xl font-black text-lime-400 mb-1">{score}</div>
          <div className="text-slate-400 mb-1">points scored</div>
          <div className="text-slate-500 text-sm mb-4">Misses: {misses}</div>
          {score >= highScore && score > 0 && (
            <div className="text-amber-400 font-bold mb-4">🏆 New High Score!</div>
          )}
          <button
            onClick={startGame}
            className="px-8 py-3 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            🔄 Play Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes molePopUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes floatUp {
          from { transform: translateX(-50%) translateY(0); opacity: 1; }
          to { transform: translateX(-50%) translateY(-60px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
