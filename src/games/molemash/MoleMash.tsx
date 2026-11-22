/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SubmitScoreModal from "@/components/SubmitScoreModal";
import "./MoleMash.css";

// ── Types ────────────────────────────────────────────────────────────────────
type MoleKind = "mole" | "gold" | "ice" | "star" | "bomb";
type GamePhase = "menu" | "playing" | "paused" | "gameover";

interface ModeConfig {
  name: string; t: number;
  s0: number; s1: number;
  g0: number; g1: number;
  dbl: number;
}

// ── Config ───────────────────────────────────────────────────────────────────
const MODES: Record<string, ModeConfig> = {
  easy:   { name:"Easy",   t:35, s0:2300, s1:1400, g0:1800, g1:1100, dbl:.10 },
  normal: { name:"Normal", t:30, s0:1800, s1:1100, g0:1500, g1: 900, dbl:.25 },
  hard:   { name:"Hard",   t:30, s0:1300, s1: 700, g0:1000, g1: 550, dbl:.45 },
};
const TUNE = [262,330,392,330,294,349,440,349,262,330,392,523,440,392,349,330];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const uid  = () => "g" + Math.random().toString(36).slice(2, 8);

// ── SVG Art ──────────────────────────────────────────────────────────────────
const PAL: Record<string, string[]> = {
  mole: ["#a0673f","#7a4a28","#e8c9a0","#ff7b9c"],
  gold: ["#ffd43b","#f59f00","#fff3bf","#ff8787"],
  ice:  ["#8fd8ff","#3a9bd9","#e7f7ff","#ff8fb0"],
  star: ["#d0a2ff","#8c4fd6","#f1e4ff","#ff8fb0"],
};

function bombBeaverSVG(dizzy: boolean): string {
  const id = uid();
  return `<svg viewBox="0 0 100 110">
    <defs><radialGradient id="${id}" cx=".35" cy=".28" r=".95">
      <stop offset="0" stop-color="#55556b"/><stop offset="1" stop-color="#15151f"/>
    </radialGradient></defs>
    <path d="M50 26 q4 -14 20 -18" stroke="#d9a066" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <g class="mm-spark"><circle cx="73" cy="7" r="8" fill="#ff922b"/><circle cx="73" cy="7" r="4" fill="#fff3bf"/></g>
    <circle cx="20" cy="50" r="11" fill="#5a3213" stroke="#2b1405" stroke-width="2"/>
    <circle cx="80" cy="50" r="11" fill="#5a3213" stroke="#2b1405" stroke-width="2"/>
    <circle cx="20" cy="50" r="5.5" fill="#c68a5b"/><circle cx="80" cy="50" r="5.5" fill="#c68a5b"/>
    <circle cx="50" cy="68" r="38" fill="url(#${id})" stroke="#0b0b12" stroke-width="2.5"/>
    <rect x="40" y="22" width="20" height="13" rx="3.5" fill="#777" stroke="#333" stroke-width="2"/>
    <ellipse cx="30" cy="48" rx="9" ry="5" fill="#fff" opacity=".22" transform="rotate(-35 30 48)"/>
    <ellipse cx="50" cy="82" rx="23" ry="17" fill="#c68a5b" stroke="#8a5a2b" stroke-width="2"/>
    ${dizzy
      ? `<path d="M29 54l12 12M41 54L29 66M59 54l12 12M71 54L59 66" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>`
      : `<circle cx="37" cy="61" r="9" fill="#fff"/><circle cx="63" cy="61" r="9" fill="#fff"/>
         <circle cx="39" cy="63" r="5" fill="#111"/><circle cx="61" cy="63" r="5" fill="#111"/>
         <circle cx="41" cy="60" r="2" fill="#fff"/><circle cx="65" cy="60" r="2" fill="#fff"/>
         <path d="M27 49 l18 6M73 49 l-18 6" stroke="#c68a5b" stroke-width="4" stroke-linecap="round"/>`}
    <ellipse cx="50" cy="74" rx="9" ry="6" fill="#2b1405"/>
    <ellipse cx="47" cy="72" rx="3" ry="1.8" fill="#fff" opacity=".5"/>
    <rect x="42.5" y="80" width="7.5" height="15" rx="2.5" fill="#fff" stroke="#2b1405" stroke-width="2"/>
    <rect x="50" y="80" width="7.5" height="15" rx="2.5" fill="#fff" stroke="#2b1405" stroke-width="2"/>
    <path d="M16 78 l14 3M16 86 l14 -1M84 78 l-14 3M84 86 l-14 -1" stroke="#e6c9a0" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function moleSVG(kind: MoleKind, dizzy: boolean): string {
  if (kind === "bomb") return bombBeaverSVG(dizzy);
  const [c1, c2, belly, nose] = PAL[kind] ?? PAL.mole;
  const id = uid();
  const badge =
    kind === "gold" ? `<path d="M30 22 l6 -14 l8 10 l6 -14 l6 14 l8 -10 l6 14 z" fill="#fff3bf" stroke="#c77700" stroke-width="3" stroke-linejoin="round"/>` :
    kind === "ice"  ? `<text x="50" y="22" font-size="26" text-anchor="middle">❄️</text>` :
    kind === "star" ? `<text x="50" y="22" font-size="26" text-anchor="middle">✨</text>` : "";
  return `<svg viewBox="0 0 100 110">
    <defs><radialGradient id="${id}" cx=".4" cy=".3" r=".9">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </radialGradient></defs>
    ${badge}
    <circle cx="24" cy="38" r="11" fill="${c2}"/>
    <circle cx="76" cy="38" r="11" fill="${c2}"/>
    <circle cx="24" cy="38" r="5.5" fill="${nose}" opacity=".8"/>
    <circle cx="76" cy="38" r="5.5" fill="${nose}" opacity=".8"/>
    <ellipse cx="50" cy="68" rx="38" ry="40" fill="url(#${id})" stroke="${c2}" stroke-width="2"/>
    <ellipse cx="50" cy="86" rx="22" ry="20" fill="${belly}"/>
    ${dizzy
      ? `<path d="M30 52l12 12M42 52L30 64M58 52l12 12M70 52L58 64" stroke="#2b1405" stroke-width="4.5" stroke-linecap="round"/>
         <circle cx="50" cy="18" r="3" fill="#ffe066"/>
         <circle cx="34" cy="22" r="3" fill="#ffe066"/>
         <circle cx="66" cy="22" r="3" fill="#ffe066"/>`
      : `<circle cx="36" cy="58" r="9" fill="#fff"/>
         <circle cx="64" cy="58" r="9" fill="#fff"/>
         <circle cx="38" cy="60" r="5" fill="#2b1405"/>
         <circle cx="62" cy="60" r="5" fill="#2b1405"/>
         <circle cx="40" cy="57" r="2" fill="#fff"/>
         <circle cx="64" cy="57" r="2" fill="#fff"/>`}
    <circle cx="25" cy="72" r="5" fill="#ff8fa3" opacity=".55"/>
    <circle cx="75" cy="72" r="5" fill="#ff8fa3" opacity=".55"/>
    <ellipse cx="50" cy="71" rx="10" ry="7" fill="${nose}"/>
    <ellipse cx="47" cy="69" rx="3" ry="1.8" fill="#fff" opacity=".6"/>
    ${dizzy
      ? `<ellipse cx="50" cy="84" rx="6" ry="5" fill="#5a1d1d"/>`
      : `<path d="M42 79 q8 8 16 0" fill="#fff" stroke="#2b1405" stroke-width="2.5" stroke-linejoin="round"/>
         <rect x="46.5" y="79" width="3.6" height="6" rx="1" fill="#fff" stroke="#2b1405" stroke-width="1.5"/>
         <rect x="50.3" y="79" width="3.6" height="6" rx="1" fill="#fff" stroke="#2b1405" stroke-width="1.5"/>`}
    <path d="M22 96 q4 -10 12 -4" stroke="${c2}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M78 96 q-4 -10 -12 -4" stroke="${c2}" stroke-width="6" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function MoleMash() {
  const [modeKey, setModeKey] = useState<string>("normal");
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [overlayTitle, setOverlayTitle] = useState("Mole Mash");
  const [overlayDesc, setOverlayDesc]   = useState("");
  const [showLegend, setShowLegend]     = useState(true);
  const [showModes, setShowModes]       = useState(true);
  const [muted, setMuted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Mutable refs — no re-render needed
  const modeRef   = useRef<ModeConfig>(MODES.normal);
  const mutedRef  = useRef(false);
  const phaseRef  = useRef<GamePhase>("menu");
  const rafRef    = useRef(0);
  const acRef     = useRef<AudioContext | null>(null);
  const musicIvRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const miRef     = useRef(0);

  const g = useRef({
    score: 0, timeLeft: 30, combo: 0, best: 0,
    spawnCd: 400, frozenUntil: 0, x2Until: 0,
    lastT: 0, running: false, paused: false, pausedAt: 0,
    holes: [] as Array<{ up: boolean; kind: MoleKind | null; ttl: number }>,
  });

  // DOM refs
  const boardRef   = useRef<HTMLDivElement>(null);
  const scoreRef   = useRef<HTMLElement | null>(null);
  const timeRef    = useRef<HTMLElement | null>(null);
  const bestRef    = useRef<HTMLElement | null>(null);
  const barFillRef = useRef<HTMLElement | null>(null);
  const barRef     = useRef<HTMLDivElement | null>(null);
  const badgesRef  = useRef<HTMLDivElement | null>(null);
  const comboRef   = useRef<HTMLDivElement | null>(null);
  const moleRefs   = useRef<Array<HTMLDivElement | null>>([]);
  const cellRefs   = useRef<Array<HTMLDivElement | null>>([]);

  // ── Audio ──────────────────────────────────────────────────────────────────
  const sfx = useCallback((f1: number, f2: number, d: number, type: OscillatorType, vol = 0.06) => {
    if (mutedRef.current) return;
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!acRef.current) acRef.current = new AC();
      const ctx = acRef.current as AudioContext;
      ctx.resume();
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f1, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(f2, ctx.currentTime + d);
      gn.gain.setValueAtTime(vol, ctx.currentTime);
      gn.gain.linearRampToValueAtTime(0, ctx.currentTime + d);
      o.connect(gn); gn.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + d);
    } catch {}
  }, []);

  const musicStart = useCallback(() => {
    if (musicIvRef.current || mutedRef.current) return;
    musicIvRef.current = setInterval(() => {
      if (g.current.paused || !g.current.running) return;
      const n = TUNE[miRef.current++ % TUNE.length];
      sfx(n, n, .2, "triangle", .022);
      if (miRef.current % 4 === 1) sfx(n / 2, n / 2, .3, "sine", .03);
    }, 240);
  }, [sfx]);

  const musicStop = useCallback(() => {
    if (musicIvRef.current) { clearInterval(musicIvRef.current); musicIvRef.current = null; }
  }, []);

  // ── Game helpers ───────────────────────────────────────────────────────────
  const showCombo = useCallback(() => {
    if (comboRef.current) {
      const c = g.current.combo;
      comboRef.current.textContent = c >= 3 ? `🔥 COMBO x${c}!` : "";
    }
  }, []);

  const hideMole = useCallback((idx: number, missed: boolean) => {
    const h = g.current.holes[idx];
    if (!h?.up) return;
    h.up = false;
    moleRefs.current[idx]?.classList.remove("mm-mole-up");
    if (missed && h.kind !== "bomb" && g.current.combo > 0) {
      g.current.combo = 0; showCombo();
    }
  }, [showCombo]);

  const popMole = useCallback((idx: number) => {
    const gc = g.current;
    const h = gc.holes[idx];
    if (!h || h.up) return;
    const r = Math.random();
    h.kind = r < .10 ? "bomb" : r < .18 ? "gold" : r < .22 ? "ice" : r < .27 ? "star" : "mole";
    const el = moleRefs.current[idx];
    if (el) {
      el.innerHTML = moleSVG(h.kind, false);
      el.classList.remove("mm-mole-hit");
      el.classList.add("mm-mole-up");
    }
    h.up = true;
    const diff = 1 - gc.timeLeft / modeRef.current.t;
    const M = modeRef.current;
    h.ttl = lerp(M.s0, M.s1, diff) * (["gold","ice","star"].includes(h.kind) ? .85 : 1);
  }, []);

  const whack = useCallback((idx: number) => {
    const gc = g.current;
    const h  = gc.holes[idx];
    if (!gc.running || gc.paused || !h?.up) return;
    h.up = false;
    const now = performance.now();
    let pts = 0, col = "#fff";

    if (h.kind === "bomb") {
      pts = -10; gc.combo = 0; col = "#ff6b6b";
      const bd = boardRef.current;
      if (bd) { bd.classList.remove("mm-shake"); void bd.offsetWidth; bd.classList.add("mm-shake"); }
      sfx(140, 50, .35, "sawtooth", .07);
      try { navigator.vibrate?.(120); } catch {}
    } else {
      gc.combo++;
      const base: Record<MoleKind, number> = { mole:1, gold:5, ice:2, star:2, bomb:0 };
      pts = (base[h.kind!] ?? 1) + Math.floor(gc.combo / 5);
      if (now < gc.x2Until) pts *= 2;
      if (h.kind === "gold") col = "#ffe066";
      if (h.kind === "ice")  { gc.frozenUntil = now + 4000; col = "#a5d8ff"; sfx(900,1500,.25,"sine",.07); }
      else if (h.kind === "star") { gc.x2Until = now + 6000; col = "#e5dbff"; sfx(700,1300,.25,"triangle",.07); }
      else sfx(480 + Math.min(gc.combo, 12) * 45, 820, .1, "square");
      try { navigator.vibrate?.(25); } catch {}
    }

    gc.score = Math.max(0, gc.score + pts);
    if (scoreRef.current) scoreRef.current.textContent = String(gc.score);
    showCombo();

    // Float score text
    const cell = cellRefs.current[idx];
    if (cell) {
      const t = document.createElement("div");
      t.className = "mm-pop"; t.textContent = (pts > 0 ? "+" : "") + pts + (h.kind === "ice" ? " ❄️" : h.kind === "star" ? " ✨" : "");
      t.style.color = col; t.style.left = "28%"; t.style.top = "12%";
      cell.appendChild(t);
      setTimeout(() => t.remove(), 800);
    }

    const el = moleRefs.current[idx];
    if (el) { el.innerHTML = moleSVG(h.kind!, true); el.classList.add("mm-mole-hit"); }
    setTimeout(() => el?.classList.remove("mm-mole-up"), 260);
  }, [sfx, showCombo]);

  // ── Confetti ───────────────────────────────────────────────────────────────
  const confetti = useCallback(() => {
    const cols = ["#ff6b6b","#ffd43b","#69db7c","#74c0fc","#da77f2"];
    for (let i = 0; i < 50; i++) {
      const c = document.createElement("div"); c.className = "mm-conf";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = cols[i % 5];
      c.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";
      c.style.animationDelay = (Math.random() * .4) + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }, []);

  // ── End game ───────────────────────────────────────────────────────────────
  const endGame = useCallback(() => {
    const gc = g.current;
    gc.running = false;
    musicStop();
    gc.holes.forEach((_, i) => hideMole(i, false));
    const nb = gc.score > gc.best && gc.score > 0;
    if (nb) {
      gc.best = gc.score;
      if (bestRef.current) bestRef.current.textContent = String(gc.best);
      try { localStorage.setItem("mm_best_" + modeRef.current.name.toLowerCase(), String(gc.best)); } catch {}
      sfx(600, 1200, .4, "triangle", .08);
      confetti();
    } else {
      sfx(400, 150, .5, "sawtooth", .05);
    }
    setTimeout(() => {
      setFinalScore(gc.score);
      setOverlayTitle(nb ? "🏆 New Best!" : "Time's Up!");
      setOverlayDesc(`You scored <b style="font-size:34px">${gc.score}</b><br/>Best: ${gc.best}`);
      setShowLegend(false); setShowModes(true);
      setPhase("gameover"); phaseRef.current = "gameover";
      if (gc.score > 0) setShowSubmitModal(true);
    }, 350);
  }, [musicStop, hideMole, sfx, confetti]);

  // ── RAF loop ───────────────────────────────────────────────────────────────
  const frameLoop = useCallback((ts: number) => {
    const gc = g.current;
    const M  = modeRef.current;
    if (gc.lastT === 0) gc.lastT = ts;
    const dt = Math.min(ts - gc.lastT, 100);
    gc.lastT = ts;

    if (gc.running && !gc.paused) {
      const now = performance.now();
      const frozen = now < gc.frozenUntil;
      if (!frozen) gc.timeLeft -= dt / 1000;

      if (timeRef.current) timeRef.current.textContent = String(Math.max(0, Math.ceil(gc.timeLeft)));
      if (barFillRef.current) {
        barFillRef.current.style.width = Math.max(0, gc.timeLeft / M.t * 100) + "%";
        barFillRef.current.style.backgroundPosition = ((1 - gc.timeLeft / M.t) * 100) + "% 0";
      }
      barRef.current?.classList.toggle("mm-bar-frozen", frozen);

      gc.spawnCd -= dt;
      if (gc.spawnCd <= 0) {
        const diff = 1 - gc.timeLeft / M.t;
        const free = gc.holes.map((h, i) => h.up ? -1 : i).filter(i => i >= 0);
        const n = Math.random() < diff * M.dbl ? 2 : 1;
        for (let k = 0; k < n && free.length > 0; k++) {
          const ri = Math.floor(Math.random() * free.length);
          popMole(free.splice(ri, 1)[0]);
        }
        gc.spawnCd = lerp(M.g0, M.g1, diff);
      }

      gc.holes.forEach((h, i) => {
        if (h.up) { h.ttl -= dt * (frozen ? .5 : 1); if (h.ttl <= 0) hideMole(i, true); }
      });

      if (badgesRef.current) {
        let b = "";
        if (frozen) b += `<span class="mm-badge">❄️ FREEZE ${Math.ceil((gc.frozenUntil - now) / 1000)}s</span>`;
        if (now < gc.x2Until) b += `<span class="mm-badge">✨ x2 ${Math.ceil((gc.x2Until - now) / 1000)}s</span>`;
        badgesRef.current.innerHTML = b;
      }

      if (gc.timeLeft <= 0) { endGame(); }
    }

    rafRef.current = requestAnimationFrame(frameLoop);
  }, [popMole, hideMole, endGame]);

  // ── Start ──────────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const gc = g.current;
    const M  = modeRef.current;
    gc.score = 0; gc.combo = 0; gc.timeLeft = M.t;
    gc.frozenUntil = 0; gc.x2Until = 0; gc.spawnCd = 400;
    gc.holes = Array(9).fill(null).map(() => ({ up: false, kind: null, ttl: 0 }));
    moleRefs.current.forEach(el => el?.classList.remove("mm-mole-up", "mm-mole-hit"));
    if (scoreRef.current) scoreRef.current.textContent = "0";
    if (timeRef.current)  timeRef.current.textContent  = String(M.t);
    if (barFillRef.current) barFillRef.current.style.width = "100%";
    if (badgesRef.current) badgesRef.current.innerHTML = "";
    if (comboRef.current)  comboRef.current.textContent = "";
    if (bestRef.current)   bestRef.current.textContent  = String(gc.best);
    gc.running = true; gc.paused = false; gc.lastT = 0;
    setPhase("playing"); phaseRef.current = "playing";
    musicStart();
  }, [musicStart]);

  // ── Pause toggle ───────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    const gc = g.current;
    if (!gc.running) return;
    if (!gc.paused) {
      gc.paused = true; gc.pausedAt = performance.now();
      setOverlayTitle("Paused"); setOverlayDesc("Take a breather.");
      setShowLegend(false); setShowModes(false);
      setPhase("paused"); phaseRef.current = "paused";
    } else {
      const gap = performance.now() - gc.pausedAt;
      if (gc.frozenUntil > gc.pausedAt) gc.frozenUntil += gap;
      if (gc.x2Until    > gc.pausedAt) gc.x2Until    += gap;
      gc.paused = false;
      setPhase("playing"); phaseRef.current = "playing";
    }
  }, []);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load saved preferences
    try {
      const mk = localStorage.getItem("mm_mode") || "normal";
      const M  = MODES[mk] || MODES.normal;
      setModeKey(mk); modeRef.current = M;
      const isMuted = localStorage.getItem("mm_muted") === "1";
      setMuted(isMuted); mutedRef.current = isMuted;
      const b = parseInt(localStorage.getItem("mm_best_" + mk) || "0");
      g.current.best = b;
    } catch {}

    g.current.holes = Array(9).fill(null).map(() => ({ up: false, kind: null, ttl: 0 }));

    // Start RAF
    rafRef.current = requestAnimationFrame(frameLoop);

    // Keyboard pause
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P" || e.key === "Escape") togglePause();
    };
    window.addEventListener("keydown", onKey);

    // Page visibility — pause when tab hidden
    const onVis = () => {
      if (document.hidden && g.current.running && !g.current.paused) togglePause();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      musicStop();
    };
  }, []); // eslint-disable-line

  // ── Mode change ────────────────────────────────────────────────────────────
  const handleMode = (k: string) => {
    const M = MODES[k]; if (!M) return;
    setModeKey(k); modeRef.current = M;
    try {
      localStorage.setItem("mm_mode", k);
      const b = parseInt(localStorage.getItem("mm_best_" + k) || "0");
      g.current.best = b;
      if (bestRef.current) bestRef.current.textContent = String(b);
      if (timeRef.current) timeRef.current.textContent  = String(M.t);
    } catch {}
  };

  // ── Mute toggle ────────────────────────────────────────────────────────────
  const toggleMute = () => {
    const nm = !mutedRef.current;
    mutedRef.current = nm; setMuted(nm);
    try { localStorage.setItem("mm_muted", nm ? "1" : "0"); } catch {}
    if (nm) musicStop(); else if (g.current.running) musicStart();
  };

  // ── Pointer hit detection ──────────────────────────────────────────────────
  const onBoardPointer = (e: React.PointerEvent) => {
    if (!g.current.running || g.current.paused) return;
    if ((e.target as HTMLElement).closest("button")) return;
    let best = -1, bd = 1e9;
    cellRefs.current.forEach((cell, idx) => {
      if (!cell || !g.current.holes[idx]?.up) return;
      const r = cell.getBoundingClientRect(), pad = 18;
      if (e.clientX > r.left - pad && e.clientX < r.right + pad &&
          e.clientY > r.top - pad  && e.clientY < r.bottom + pad) {
        const d = Math.hypot(e.clientX - (r.left + r.right) / 2, e.clientY - (r.top + r.bottom) / 2);
        if (d < bd) { bd = d; best = idx; }
      }
    });
    if (best >= 0) whack(best);
  };

  const isOverlay = phase !== "playing";

  return (
    <div className="mm-wrap">
      {/* Animated clouds */}
      <div className="mm-cloud" />
      <div className="mm-cloud mm-cloud2" />

      <div className="mm-app">
        {/* HUD */}
        <div className="mm-hud">
          <div className="mm-stat"><span>SCORE</span><b ref={el => { scoreRef.current = el; }}>0</b></div>
          <div className="mm-stat"><span>TIME</span><b ref={el => { timeRef.current = el; }}>{modeRef.current.t}</b></div>
          <div className="mm-stat"><span>BEST</span><b ref={el => { bestRef.current = el; }}>{g.current.best}</b></div>
        </div>

        {/* Timer bar */}
        <div className="mm-bar" ref={barRef}>
          <i className="mm-barfill" ref={el => { barFillRef.current = el; }} />
        </div>

        {/* Title + controls */}
        <div className="mm-titlerow">
          <div className="mm-title">MOLE MASH</div>
          <div className="mm-ctrl">
            <button className="mm-ib" onClick={togglePause} title="Pause">⏸</button>
            <button className="mm-ib" onClick={toggleMute} title="Sound">{muted ? "🔇" : "🔊"}</button>
          </div>
        </div>

        {/* Power-up badges */}
        <div className="mm-badges" ref={badgesRef} />

        {/* Combo display */}
        <div className="mm-combo" ref={comboRef} />

        {/* 3×3 mole board */}
        <div className="mm-board" ref={boardRef} onPointerDown={onBoardPointer}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="mm-cell" ref={el => { cellRefs.current[i] = el; }}>
              <div className="mm-back" />
              <div className="mm-mole" ref={el => { moleRefs.current[i] = el; }} />
              <div className="mm-front" />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay — menu / paused / gameover */}
      {isOverlay && (
        <div className="mm-overlay">
          <div className="mm-card">
            <h2 dangerouslySetInnerHTML={{ __html: overlayTitle }} />

            {phase === "menu" ? (
              <p>Smack the moles before they hide!<br />Don&apos;t hit the bomb-beaver!</p>
            ) : (
              overlayDesc && <p dangerouslySetInnerHTML={{ __html: overlayDesc }} />
            )}

            {showLegend && (
              <div className="mm-legend">
                <div>🐹 +1</div><div>👑 +5</div>
                <div>❄️ Freeze time</div><div>✨ Double pts</div><div>💣 Bomb −10</div>
              </div>
            )}

            {showModes && (
              <div className="mm-modes">
                {Object.keys(MODES).map(k => (
                  <button key={k} className={`mm-mode${modeKey === k ? " mm-mode-on" : ""}`} onClick={() => handleMode(k)}>
                    {MODES[k].name}
                  </button>
                ))}
              </div>
            )}

            <div className="mm-btns">
              {phase === "paused" ? (
                <button onClick={togglePause}>RESUME</button>
              ) : (
                <>
                  <button onClick={startGame}>{phase === "menu" ? "PLAY" : "PLAY AGAIN"}</button>
                  {phase === "gameover" && finalScore > 0 && (
                    <button 
                      onClick={() => setShowSubmitModal(true)} 
                      style={{ background: "#4f46e5", color: "#fff" }}
                    >
                      SAVE SCORE
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={finalScore}
        gameId="molemash"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
