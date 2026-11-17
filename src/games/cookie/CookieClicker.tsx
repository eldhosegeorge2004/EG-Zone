/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface Upgrade {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  baseCps: number;
  description: string;
  count: number;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  born: number;
}

const UPGRADES_TEMPLATE: Omit<Upgrade, "count">[] = [
  { id: "cursor", name: "Cursor", emoji: "🖱️", baseCost: 15, baseCps: 0.1, description: "Auto-clicks the cookie." },
  { id: "grandma", name: "Grandma", emoji: "👵", baseCost: 100, baseCps: 0.5, description: "A nice grandma baking cookies." },
  { id: "farm", name: "Farm", emoji: "🌾", baseCost: 1100, baseCps: 4, description: "Grows cookie plants." },
  { id: "mine", name: "Mine", emoji: "⛏️", baseCost: 12000, baseCps: 10, description: "Mines cookie dough." },
  { id: "factory", name: "Factory", emoji: "🏭", baseCost: 130000, baseCps: 40, description: "Mass-produces cookies." },
  { id: "bank", name: "Bank", emoji: "🏦", baseCost: 1400000, baseCps: 100, description: "Generates cookie interest." },
  { id: "temple", name: "Temple", emoji: "🏛️", baseCost: 20000000, baseCps: 400, description: "Devoted to the cookie gods." },
  { id: "wizard", name: "Wizard Tower", emoji: "🧙", baseCost: 330000000, baseCps: 1600, description: "Conjures cookies from magic." },
];

const ACHIEVEMENTS = [
  { id: "a1", name: "First Cookie", threshold: 1, emoji: "🍪" },
  { id: "a2", name: "Baker", threshold: 100, emoji: "👨‍🍳" },
  { id: "a3", name: "Mass Producer", threshold: 10000, emoji: "🏭" },
  { id: "a4", name: "Millionaire", threshold: 1000000, emoji: "💰" },
  { id: "a5", name: "Billionaire", threshold: 1000000000, emoji: "💎" },
  { id: "a6", name: "Trillionaire", threshold: 1000000000000, emoji: "👑" },
];

function formatNum(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return Math.floor(n).toString();
}

function upgradeCost(base: number, count: number): number {
  return Math.floor(base * Math.pow(1.15, count));
}

function totalCps(upgrades: Upgrade[]): number {
  return upgrades.reduce((acc, u) => acc + u.baseCps * u.count, 0);
}

function playClickSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

function playBuySound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume();
    [440, 550, 660].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.1);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.1);
    });
  } catch {}
}

function playAchievementSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume();
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.15);
    });
  } catch {}
}

interface SaveState {
  cookies: number;
  totalEarned: number;
  upgrades: { id: string; count: number }[];
  unlockedAchievements: string[];
  prestigeCount: number;
}

export default function CookieClicker() {
  const [cookies, setCookies] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(
    UPGRADES_TEMPLATE.map((u) => ({ ...u, count: 0 }))
  );
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [toastAchievement, setToastAchievement] = useState<string | null>(null);
  const [prestigeCount, setPrestigeCount] = useState(0);
  const [cookieAnim, setCookieAnim] = useState(false);

  const cookiesRef = useRef(cookies);
  const totalEarnedRef = useRef(totalEarned);
  const upgradesRef = useRef(upgrades);
  const unlockedRef = useRef(unlockedAchievements);
  const floatIdRef = useRef(0);

  cookiesRef.current = cookies;
  totalEarnedRef.current = totalEarned;
  upgradesRef.current = upgrades;
  unlockedRef.current = unlockedAchievements;

  // Load save
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cookie_save");
      if (raw) {
        const save: SaveState = JSON.parse(raw);
        setCookies(save.cookies || 0);
        setTotalEarned(save.totalEarned || 0);
        setPrestigeCount(save.prestigeCount || 0);
        if (save.upgrades) {
          setUpgrades(UPGRADES_TEMPLATE.map((u) => {
            const found = save.upgrades.find((s) => s.id === u.id);
            return { ...u, count: found?.count || 0 };
          }));
        }
        if (save.unlockedAchievements) setUnlockedAchievements(save.unlockedAchievements);
      }
    } catch {}
  }, []);

  // Auto-save every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const save: SaveState = {
          cookies: cookiesRef.current,
          totalEarned: totalEarnedRef.current,
          upgrades: upgradesRef.current.map((u) => ({ id: u.id, count: u.count })),
          unlockedAchievements: unlockedRef.current,
          prestigeCount,
        };
        localStorage.setItem("cookie_save", JSON.stringify(save));
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [prestigeCount]);

  // CPS tick
  useEffect(() => {
    const interval = setInterval(() => {
      const cps = totalCps(upgradesRef.current);
      if (cps > 0) {
        setCookies((c) => c + cps);
        setTotalEarned((t) => t + cps);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Achievement checker
  useEffect(() => {
    ACHIEVEMENTS.forEach((a) => {
      if (!unlockedAchievements.includes(a.id) && totalEarned >= a.threshold) {
        setUnlockedAchievements((prev) => [...prev, a.id]);
        setToastAchievement(`${a.emoji} ${a.name} unlocked!`);
        playAchievementSound();
        setTimeout(() => setToastAchievement(null), 3000);
      }
    });
  }, [totalEarned, unlockedAchievements]);

  // Clean up old floats
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloats((f) => f.filter((ft) => now - ft.born < 1200));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  function handleCookieClick(e: React.MouseEvent | React.TouchEvent) {
    playClickSound();
    setCookieAnim(true);
    setTimeout(() => setCookieAnim(false), 100);

    const perClick = 1 + upgradesRef.current.find((u) => u.id === "cursor")!.count * 0.1;
    const gained = Math.max(1, Math.floor(perClick));
    setCookies((c) => c + gained);
    setTotalEarned((t) => t + gained);

    let clientX = 0, clientY = 0;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const id = floatIdRef.current++;
    setFloats((f) => [
      ...f,
      {
        id,
        x: clientX + (Math.random() - 0.5) * 40,
        y: clientY - 20,
        text: `+${gained}`,
        color: "#fbbf24",
        born: Date.now(),
      },
    ]);
  }

  function buyUpgrade(upgradeId: string) {
    const idx = upgrades.findIndex((u) => u.id === upgradeId);
    if (idx === -1) return;
    const u = upgrades[idx];
    const cost = upgradeCost(u.baseCost, u.count);
    if (cookies < cost) return;
    playBuySound();
    setCookies((c) => c - cost);
    setUpgrades((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], count: next[idx].count + 1 };
      return next;
    });
  }

  function handlePrestige() {
    if (totalEarned < 1e9) return;
    const newPrestige = prestigeCount + 1;
    setPrestigeCount(newPrestige);
    setCookies(0);
    setTotalEarned(0);
    setUpgrades(UPGRADES_TEMPLATE.map((u) => ({ ...u, count: 0 })));
    setUnlockedAchievements([]);
    try {
      localStorage.removeItem("cookie_save");
    } catch {}
  }

  const cps = totalCps(upgrades);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-orange-950 to-slate-900 text-white select-none">
      {/* Achievement toast */}
      {toastAchievement && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black font-bold px-6 py-3 rounded-xl shadow-2xl text-sm animate-bounce">
          {toastAchievement}
        </div>
      )}

      {/* Floating texts */}
      {floats.map((ft) => {
        const age = Date.now() - ft.born;
        const opacity = Math.max(0, 1 - age / 1200);
        return (
          <div
            key={ft.id}
            style={{
              position: "fixed",
              left: ft.x,
              top: ft.y - age * 0.06,
              color: ft.color,
              fontWeight: 700,
              fontSize: 20,
              pointerEvents: "none",
              zIndex: 100,
              opacity,
              textShadow: "0 0 8px rgba(251,191,36,0.8)",
            }}
          >
            {ft.text}
          </div>
        );
      })}

      <div className="flex flex-col lg:flex-row gap-0 min-h-screen">
        {/* Left: Cookie area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <h1 className="text-3xl font-bold text-amber-300">🍪 Cookie Clicker</h1>

          {/* Stats */}
          <div className="text-center">
            <div className="text-5xl font-black text-amber-300">{formatNum(cookies)}</div>
            <div className="text-amber-500 text-sm mt-1">cookies</div>
            <div className="text-slate-400 text-sm mt-1">{formatNum(cps)} per second</div>
            <div className="text-slate-500 text-xs mt-1">Total: {formatNum(totalEarned)}</div>
          </div>

          {/* Cookie button */}
          <button
            onClick={handleCookieClick}
            onTouchStart={handleCookieClick}
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #d97706, #92400e)",
              border: "4px solid #f59e0b",
              cursor: "pointer",
              fontSize: 80,
              transform: cookieAnim ? "scale(0.9)" : "scale(1)",
              transition: "transform 0.08s ease",
              boxShadow: "0 0 40px rgba(245,158,11,0.4), inset 0 -4px 10px rgba(0,0,0,0.3)",
              userSelect: "none",
            }}
            aria-label="Click cookie"
          >
            🍪
          </button>

          {/* Prestige */}
          {prestigeCount > 0 && (
            <div className="text-purple-400 text-sm font-semibold">⭐ Prestige ×{prestigeCount}</div>
          )}
          {totalEarned >= 1e9 && (
            <button
              onClick={handlePrestige}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold rounded-lg transition-all"
            >
              ✨ Prestige Reset
            </button>
          )}

          {/* Achievements */}
          <div className="flex flex-wrap justify-center gap-2 max-w-xs">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedAchievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  title={a.name}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                    unlocked ? "bg-amber-500/30 border border-amber-500" : "bg-slate-800 border border-slate-700 opacity-40"
                  }`}
                >
                  {unlocked ? a.emoji : "?"}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Shop */}
        <div className="w-full lg:w-72 bg-slate-900/80 border-t lg:border-t-0 lg:border-l border-slate-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold text-amber-300 mb-4">🏪 Upgrades</h2>
            <div className="space-y-3">
              {upgrades.map((u) => {
                const cost = upgradeCost(u.baseCost, u.count);
                const canAfford = cookies >= cost;
                return (
                  <button
                    key={u.id}
                    onClick={() => buyUpgrade(u.id)}
                    disabled={!canAfford}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      canAfford
                        ? "bg-amber-900/50 border-amber-700/50 hover:bg-amber-800/60 hover:border-amber-600 cursor-pointer"
                        : "bg-slate-800/50 border-slate-700/50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{u.emoji}</span>
                        <div>
                          <div className="text-sm font-bold text-white">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.baseCps * (u.count + 1)}/s</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-amber-400 font-bold">{formatNum(cost)} 🍪</div>
                        {u.count > 0 && (
                          <div className="text-xs text-slate-500">×{u.count}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{u.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
