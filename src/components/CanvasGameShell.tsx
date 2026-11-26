/* eslint-disable */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import SubmitScoreModal from "@/components/SubmitScoreModal";
import { fmtT, getModeSeed, hashStr, rngFrom } from "@/lib/canvasGameUtils";

export interface CanvasShellApi {
  W: number;
  H: number;
  playing: () => boolean;
  pos: (e: React.PointerEvent<HTMLCanvasElement>) => { x: number; y: number };
  toast: (msg: string) => void;
  finish: (value: number) => void;
}

export interface CanvasGameTheme {
  wrapperBg: string;
  cardBg: string;
  canvasBg: string;
  border: string;
  text: string;
  mute: string;
  accent: string;
  accentText: string;
  sun: string;
  sunText: string;
}

export interface CanvasGameConfig {
  gameId: string;
  title: string;
  overTitle: string;
  unit: "score" | "time";
  lowerIsBetter: boolean;
  aspect: number;
  labels: [string, string];
  intro: string;
  help: string;
  theme: CanvasGameTheme;
  maxWidth?: number;
  computeLeaderboardScore?: (finalValue: number) => number;
  onInit: (rnd: () => number, api: CanvasShellApi) => void;
  onUpdate?: (dt: number, t: number) => void;
  onDraw: (ctx: CanvasRenderingContext2D, W: number, H: number, t: number) => void;
  getHud: (t: number) => [string | number, string | number];
  onPointerDown?: (e: React.PointerEvent<HTMLCanvasElement>, api: CanvasShellApi) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLCanvasElement>, api: CanvasShellApi) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLCanvasElement>, api: CanvasShellApi) => void;
  onPointerCancel?: (e: React.PointerEvent<HTMLCanvasElement>, api: CanvasShellApi) => void;
  onKeyDown?: (e: KeyboardEvent, api: CanvasShellApi) => void;
  renderControls?: (api: CanvasShellApi, phase: "pre" | "play" | "done") => React.ReactNode;
}

export default function CanvasGameShell({ config }: { config: CanvasGameConfig }) {
  const {
    gameId,
    overTitle,
    unit,
    lowerIsBetter,
    aspect,
    labels,
    intro,
    help,
    theme,
    maxWidth = 420,
    computeLeaderboardScore,
  } = config;

  const [mode, setMode] = useState<"daily" | "random">("daily");
  const [phase, setPhase] = useState<"pre" | "play" | "done">("pre");
  const [hud, setHud] = useState<[string | number, string | number]>(["-", "-"]);
  const [best, setBest] = useState<number | null>(null);
  const [finalVal, setFinalVal] = useState<number>(0);
  const [prevBest, setPrevBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<"pre" | "play" | "done">("pre");
  const modeRef = useRef<"daily" | "random">("daily");
  const seedRef = useRef<string>("");
  const dateRef = useRef<string>("");
  const timeRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const sizeRef = useRef<{ W: number; H: number }>({ W: 360, H: Math.round(360 * aspect) });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const formatVal = useCallback(
    (v: number) => (unit === "time" ? fmtT(v) : String(v)),
    [unit]
  );

  const getBestKey = useCallback(
    (m: "daily" | "random", d: string) =>
      `egz-${gameId}-best-${m === "daily" ? d : "random"}`,
    [gameId]
  );

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(""), 1200);
  }, []);

  const finishGame = useCallback(
    (rawVal: number) => {
      if (phaseRef.current !== "play") return;
      phaseRef.current = "done";
      setPhase("done");

      const val = unit === "time" ? Math.round(rawVal * 10) / 10 : rawVal;
      setFinalVal(val);

      const key = getBestKey(modeRef.current, dateRef.current);
      let prev: number | null = null;
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) prev = Number(stored);
      } catch {}

      const rec = prev === null || (lowerIsBetter ? val < prev : val > prev);
      setPrevBest(prev);
      setIsNewBest(rec);
      if (rec) {
        try {
          localStorage.setItem(key, String(val));
        } catch {}
        setBest(val);
      }

      setTimeout(() => {
        if (phaseRef.current === "done") {
          setShowOverlay(true);
          setShowSubmitModal(true);
        }
      }, 650);
    },
    [getBestKey, lowerIsBetter, unit]
  );

  const apiRef = useRef<CanvasShellApi>({
    get W() {
      return sizeRef.current.W;
    },
    get H() {
      return sizeRef.current.H;
    },
    playing: () => phaseRef.current === "play",
    pos: (e: React.PointerEvent<HTMLCanvasElement>) => {
      const cv = canvasRef.current;
      if (!cv) return { x: 0, y: 0 };
      const b = cv.getBoundingClientRect();
      return {
        x: ((e.clientX - b.left) * sizeRef.current.W) / b.width,
        y: ((e.clientY - b.top) * sizeRef.current.H) / b.height,
      };
    },
    toast: showToast,
    finish: finishGame,
  });

  const syncCanvasSize = useCallback(() => {
    const cv = canvasRef.current;
    const stage = stageRef.current;
    if (!cv || !stage) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const available = stage.clientWidth > 0 ? stage.clientWidth : maxWidth;
    const W = Math.max(240, Math.min(maxWidth, available - 4));
    const H = Math.round(W * aspect);
    sizeRef.current = { W, H };
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.aspectRatio = `${W} / ${H}`;
  }, [aspect, maxWidth]);

  const loadMode = useCallback(
    (m: "daily" | "random", fresh = true) => {
      const { seed, date } = getModeSeed(gameId, m);
      if (m === "daily" || fresh || m !== modeRef.current || !seedRef.current) {
        seedRef.current = seed;
      }
      dateRef.current = date;
      modeRef.current = m;
      setMode(m);

      phaseRef.current = "pre";
      setPhase("pre");
      setShowOverlay(false);
      setShowSubmitModal(false);
      timeRef.current = 0;

      syncCanvasSize();
      configRef.current.onInit(rngFrom(hashStr(seedRef.current)), apiRef.current);
      setHud(configRef.current.getHud(0));

      try {
        const stored = localStorage.getItem(getBestKey(m, date));
        setBest(stored !== null ? Number(stored) : null);
      } catch {
        setBest(null);
      }
    },
    [gameId, getBestKey, syncCanvasSize]
  );

  const startGame = useCallback(() => {
    syncCanvasSize();
    configRef.current.onInit(rngFrom(hashStr(seedRef.current)), apiRef.current);
    timeRef.current = 0;
    lastTsRef.current = performance.now();
    phaseRef.current = "play";
    setPhase("play");
    setShowOverlay(false);
    setHud(configRef.current.getHud(0));
  }, [syncCanvasSize]);

  useEffect(() => {
    loadMode("daily", true);
    const onResize = () => syncCanvasSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [loadMode, syncCanvasSize]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (configRef.current.onKeyDown) {
        configRef.current.onKeyDown(e, apiRef.current);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    let rafId = 0;
    const loop = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000 || 0);
      lastTsRef.current = ts;

      if (phaseRef.current === "play") {
        timeRef.current += dt;
        configRef.current.onUpdate?.(dt, timeRef.current);
        if (phaseRef.current === "play") {
          setHud(configRef.current.getHud(timeRef.current));
        }
      }

      const cv = canvasRef.current;
      if (cv) {
        const ctx = cv.getContext("2d");
        if (ctx) {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const { W, H } = sizeRef.current;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);
          configRef.current.onDraw(ctx, W, H, timeRef.current);
        }
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const leaderboardScore = computeLeaderboardScore
    ? computeLeaderboardScore(finalVal)
    : Math.round(finalVal);

  return (
    <>
      <div
        className="w-full max-w-[440px] mx-auto rounded-2xl p-4 sm:p-5 select-none"
        style={{
          background: theme.wrapperBg,
          color: theme.text,
        }}
      >
        {/* HUD */}
        <div
          className="grid grid-cols-3 gap-2 p-2.5 mb-3 rounded-xl text-center border-2"
          style={{
            background: theme.cardBg,
            borderColor: theme.border,
          }}
        >
          <div>
            <span className="block text-[11px] uppercase tracking-wider font-bold" style={{ color: theme.mute }}>
              {labels[0]}
            </span>
            <b className="block text-xl sm:text-2xl font-mono font-extrabold leading-tight">
              {hud[0]}
            </b>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider font-bold" style={{ color: theme.mute }}>
              {labels[1]}
            </span>
            <b className="block text-xl sm:text-2xl font-mono font-extrabold leading-tight">
              {hud[1]}
            </b>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider font-bold" style={{ color: theme.mute }}>
              Best
            </span>
            <b className="block text-xl sm:text-2xl font-mono font-extrabold leading-tight">
              {best === null ? "--" : formatVal(best)}
            </b>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => loadMode("daily")}
            className="flex-1 py-2 px-3 rounded-xl font-bold text-sm border-2 transition-transform active:scale-95 cursor-pointer"
            style={{
              borderColor: theme.border,
              background: mode === "daily" ? theme.sun : theme.cardBg,
              color: mode === "daily" ? theme.sunText : theme.text,
            }}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => loadMode("random")}
            className="flex-1 py-2 px-3 rounded-xl font-bold text-sm border-2 transition-transform active:scale-95 cursor-pointer"
            style={{
              borderColor: theme.border,
              background: mode === "random" ? theme.sun : theme.cardBg,
              color: mode === "random" ? theme.sunText : theme.text,
            }}
          >
            Random
          </button>
        </div>

        {/* Pre-game Start Box */}
        {phase === "pre" && (
          <div
            className="p-5 rounded-xl border-2 text-center mb-3"
            style={{
              background: theme.cardBg,
              borderColor: theme.border,
            }}
          >
            <p className="font-bold text-sm sm:text-base mb-4 leading-relaxed">{intro}</p>
            <button
              type="button"
              onClick={startGame}
              className="w-full py-3.5 px-6 rounded-xl font-black text-lg border-2 transition-transform active:scale-95 cursor-pointer"
              style={{
                background: theme.accent,
                color: theme.accentText,
                borderColor: theme.border,
              }}
            >
              Start Game
            </button>
          </div>
        )}

        {/* Stage */}
        <div ref={stageRef} className={phase === "pre" ? "w-full opacity-0 pointer-events-none h-0 overflow-hidden" : "w-full"}>
          <div className="relative w-full mb-3">
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => configRef.current.onPointerDown?.(e, apiRef.current)}
              onPointerMove={(e) => configRef.current.onPointerMove?.(e, apiRef.current)}
              onPointerUp={(e) => configRef.current.onPointerUp?.(e, apiRef.current)}
              onPointerCancel={(e) => configRef.current.onPointerCancel?.(e, apiRef.current)}
              className="block w-full rounded-xl border-2 touch-none"
              style={{
                background: theme.canvasBg,
                borderColor: theme.border,
              }}
            />
            {toastMsg && (
              <div className="absolute left-0 right-0 top-2.5 text-center font-bold pointer-events-none">
                <span
                  className="inline-block px-3 py-1 rounded-lg border-2 text-sm"
                  style={{
                    background: theme.sun,
                    color: theme.sunText,
                    borderColor: theme.border,
                  }}
                >
                  {toastMsg}
                </span>
              </div>
            )}

            {/* Game Over Overlay */}
            {showOverlay && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4 rounded-xl bg-slate-950/70 backdrop-blur-xs">
                <div
                  className="w-full max-w-[320px] p-5 rounded-2xl border-2 text-center shadow-2xl"
                  style={{
                    background: theme.cardBg,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                >
                  <h2 className="text-xl font-black uppercase tracking-wide mb-1">{overTitle}</h2>
                  <div className="text-4xl font-mono font-black my-2">
                    {unit === "time" ? formatVal(finalVal) : `${finalVal} pts`}
                  </div>
                  {isNewBest && (
                    <div
                      className="inline-block px-3 py-0.5 mb-2 rounded-lg border-2 font-black text-xs -rotate-2"
                      style={{
                        background: theme.sun,
                        color: theme.sunText,
                        borderColor: theme.border,
                      }}
                    >
                      NEW BEST!
                    </div>
                  )}
                  <p className="text-xs font-bold mb-4" style={{ color: theme.mute }}>
                    {isNewBest
                      ? prevBest === null
                        ? "Your first score!"
                        : `Previous best: ${formatVal(prevBest)}`
                      : `Your best: ${prevBest === null ? "--" : formatVal(prevBest)}`}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSubmitModal(true);
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-sm border-2 cursor-pointer"
                      style={{
                        background: theme.sun,
                        color: theme.sunText,
                        borderColor: theme.border,
                      }}
                    >
                      Save Score ({leaderboardScore} pts)
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadMode(mode, true)}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm border-2 cursor-pointer"
                        style={{
                          background: theme.accent,
                          color: theme.accentText,
                          borderColor: theme.border,
                        }}
                      >
                        Play Again
                      </button>
                      <button
                        type="button"
                        onClick={() => loadMode(mode, false)}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm border-2 cursor-pointer"
                        style={{
                          background: theme.cardBg,
                          color: theme.text,
                          borderColor: theme.border,
                        }}
                      >
                        Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Extra Controls */}
          {config.renderControls && (
            <div className="flex items-center gap-2 mb-3">
              {config.renderControls(apiRef.current, phase)}
            </div>
          )}

          {/* Help Text */}
          <p className="text-center text-xs sm:text-sm font-medium" style={{ color: theme.mute }}>
            {help}
          </p>
        </div>
      </div>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={leaderboardScore}
        gameId={gameId}
        onClose={() => setShowSubmitModal(false)}
      />
    </>
  );
}
