/* eslint-disable */
"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

type SeatType = "human" | "cpu" | "off";

interface LudoState {
  types: SeatType[];
  pos: number[][];
  turn: number;
  die: number | null;
  sixes: number;
  ranks: number[];
  over: boolean;
}

const NAMES = ["Red", "Green", "Yellow", "Blue"] as const;
const COLORS = ["#d93636", "#1f9d55", "#e8a800", "#2368d8"] as const;
const STARTS = [0, 13, 26, 39];
const SAFE = [0, 13, 26, 39, 8, 21, 34, 47];
const HOME = 56;
const YARD: [number, number][] = [
  [0, 0],
  [9, 0],
  [9, 9],
  [0, 9],
];
const FIN: [number, number][] = [
  [6.5, 7.5],
  [7.5, 6.5],
  [8.5, 7.5],
  [7.5, 8.5],
];
const LANE: ((k: number) => [number, number])[] = [
  (k) => [1 + k, 7],
  (k) => [7, 1 + k],
  (k) => [13 - k, 7],
  (k) => [7, 13 - k],
];

const TRACK: [number, number][] = (() => {
  const out: [number, number][] = [];
  const run = (x1: number, y1: number, x2: number, y2: number) => {
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let k = 0; k <= n; k++) {
      out.push([x1 + Math.sign(x2 - x1) * k, y1 + Math.sign(y2 - y1) * k]);
    }
  };
  run(1, 6, 5, 6);
  run(6, 5, 6, 0);
  run(7, 0, 7, 0);
  run(8, 0, 8, 5);
  run(9, 6, 14, 6);
  run(14, 7, 14, 7);
  run(14, 8, 9, 8);
  run(8, 9, 8, 14);
  run(7, 14, 7, 14);
  run(6, 14, 6, 9);
  run(5, 8, 0, 8);
  run(0, 7, 0, 6);
  return out;
})();

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const cell = (c: number, p: number) => (STARTS[c] + p) % 52;

function yardSpots(c: number): [number, number][] {
  const [x, y] = YARD[c];
  return [
    [x + 2, y + 2],
    [x + 4, y + 2],
    [x + 2, y + 4],
    [x + 4, y + 4],
  ];
}

function spot(c: number, i: number, p: number): [number, number] {
  if (p < 0) return yardSpots(c)[i];
  if (p === HOME) {
    const [x, y] = FIN[c];
    const o = (i - 1.5) * 0.34;
    return c % 2 ? [x + o, y] : [x, y + o];
  }
  const [x, y] = p <= 50 ? TRACK[cell(c, p)] : LANE[c](p - 51);
  return [x + 0.5, y + 0.5];
}

function createGame(types: SeatType[]): LudoState {
  const g: LudoState = {
    types,
    pos: types.map(() => [-1, -1, -1, -1]),
    turn: 0,
    die: null,
    sixes: 0,
    ranks: [],
    over: false,
  };
  g.turn = Math.max(0, types.findIndex((t) => t !== "off"));
  return g;
}

function legalMoves(g: LudoState, d: number): number[] {
  return [0, 1, 2, 3].filter((i) => {
    const p = g.pos[g.turn][i];
    return p < 0 ? d === 6 : p + d <= HOME;
  });
}

function victims(g: LudoState, c: number, p: number): [number, number][] {
  if (p < 0 || p > 50 || SAFE.includes(cell(c, p))) return [];
  const out: [number, number][] = [];
  g.pos.forEach((ts, o) => {
    if (o !== c && g.types[o] !== "off") {
      ts.forEach((q, i) => {
        if (q >= 0 && q <= 50 && cell(o, q) === cell(c, p)) out.push([o, i]);
      });
    }
  });
  return out;
}

function advanceTurn(g: LudoState) {
  g.sixes = 0;
  do {
    g.turn = (g.turn + 1) % 4;
  } while (g.types[g.turn] === "off" || g.ranks.includes(g.turn));
}

function applyMove(g: LudoState, i: number, d: number) {
  const c = g.turn;
  const from = g.pos[c][i];
  const to = from < 0 ? 0 : from + d;
  const hit = victims(g, c, to);
  g.pos[c][i] = to;
  hit.forEach(([o, j]) => {
    g.pos[o][j] = -1;
  });
  let done = false;
  if (g.pos[c].every((p) => p === HOME)) {
    done = true;
    g.ranks.push(c);
    const left = [0, 1, 2, 3].filter(
      (k) => g.types[k] !== "off" && !g.ranks.includes(k)
    );
    if (left.length < 2) {
      g.ranks.push(...left);
      g.over = true;
    }
  }
  const again = !done && (d === 6 || hit.length > 0 || to === HOME);
  if (!g.over && !again) advanceTurn(g);
  return { hit, again, done, to };
}

function danger(g: LudoState, c: number, p: number): number {
  if (p < 0 || p > 50 || SAFE.includes(cell(c, p))) return 0;
  const here = cell(c, p);
  let n = 0;
  g.pos.forEach((ts, o) => {
    if (o !== c && g.types[o] !== "off") {
      ts.forEach((q) => {
        if (q < 0) {
          const k = (here - STARTS[o] + 52) % 52;
          if (k >= 1 && k <= 6) n += 0.5;
          return;
        }
        if (q > 50) return;
        const k = (here - cell(o, q) + 52) % 52;
        if (k >= 1 && k <= 6 && q + k <= 50) n++;
      });
    }
  });
  return n;
}

function chooseCpuMove(g: LudoState, moves: number[], d: number): number {
  const c = g.turn;
  let best = moves[0];
  let top = -1e9;
  for (const i of moves) {
    const from = g.pos[c][i];
    const to = from < 0 ? 0 : from + d;
    let s = to * 0.4 + Math.random();
    if (to === HOME) s += 90;
    const hit = victims(g, c, to);
    hit.forEach(([o, j]) => {
      s += 100 + g.pos[o][j];
    });
    if (from < 0) s += 60;
    if (from <= 50 && to > 50) s += 40;
    if (to <= 50 && SAFE.includes(cell(c, to))) s += 25;
    s += (danger(g, c, from) - danger(g, c, to)) * (20 + Math.max(to, 0) * 0.8);
    if (s > top) {
      top = s;
      best = i;
    }
  }
  return best;
}

function starPoints(x: number, y: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const r = k % 2 ? 15 : 36;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    pts.push(`${x + r * Math.cos(a)},${y + r * Math.sin(a)}`);
  }
  return pts.join(" ");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function LudoGame() {
  const [seats, setSeats] = useState<SeatType[]>(["human", "cpu", "cpu", "cpu"]);
  const [game, setGame] = useState<LudoState>(() =>
    createGame(["human", "cpu", "cpu", "cpu"])
  );
  const [dieFaces, setDieFaces] = useState<number[]>([6, 6, 6, 6]);
  const [rollingIdx, setRollingIdx] = useState<number | null>(null);
  const [waiting, setWaiting] = useState<number[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [hopTok, setHopTok] = useState<{ c: number; i: number } | null>(null);
  const [msg, setMsg] = useState("Tap your dice to roll.");
  const [muted, setMuted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [humanWinScore, setHumanWinScore] = useState(0);

  const genRef = useRef(0);
  const gameRef = useRef(game);
  gameRef.current = game;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const waitingRef = useRef(waiting);
  waitingRef.current = waiting;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const acRef = useRef<AudioContext | null>(null);

  const unlockAudio = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      acRef.current = acRef.current || new AudioCtx();
      if (acRef.current.state === "suspended") {
        acRef.current.resume().catch(() => {});
      }
    } catch {}
  }, []);

  const tone = useCallback(
    (
      f: number,
      at = 0,
      len = 0.09,
      type: OscillatorType = "triangle",
      vol = 0.12
    ) => {
      const ac = acRef.current;
      if (mutedRef.current || !ac || ac.state !== "running") return;
      const o = ac.createOscillator();
      const v = ac.createGain();
      const t = ac.currentTime + at;
      o.type = type;
      o.frequency.value = f;
      v.gain.setValueAtTime(vol, t);
      v.gain.exponentialRampToValueAtTime(0.001, t + len);
      o.connect(v).connect(ac.destination);
      o.start(t);
      o.stop(t + len);
    },
    []
  );

  const sfx = useMemo(
    () => ({
      rattle: () => tone(180 + Math.random() * 220, 0, 0.04, "square", 0.05),
      step: () => tone(520, 0, 0.06),
      hit: () =>
        [330, 220, 140].forEach((f, k) => tone(f, k * 0.09, 0.14, "sawtooth", 0.09)),
      home: () => [523, 659, 784].forEach((f, k) => tone(f, k * 0.09, 0.18)),
      win: () =>
        [523, 659, 784, 1047, 784, 1047].forEach((f, k) =>
          tone(f, k * 0.13, 0.22)
        ),
    }),
    [tone]
  );

  const saveGame = useCallback((g: LudoState) => {
    try {
      localStorage.setItem("egz-ludo-v2", JSON.stringify(g));
    } catch {}
  }, []);

  const rollRef = useRef<() => Promise<void>>(async () => {});

  const beginTurn = useCallback(
    (g: LudoState, prev?: string) => {
      setBusy(false);
      busyRef.current = false;
      setWaiting(null);
      waitingRef.current = null;
      saveGame(g);
      const prompt = g.die !== null && prev ? `${prev} ` : "";
      if (g.over) {
        const winner = g.ranks[0];
        const hasCpu = g.types.some((t) => t === "cpu");
        if (hasCpu && g.types[winner] === "human") {
          const opponentsCount = g.types.filter((t) => t === "cpu").length;
          const score = 1000 + opponentsCount * 150;
          setHumanWinScore(score);
          setTimeout(() => setShowSubmitModal(true), 700);
        }
        return;
      }
      if (g.types[g.turn] === "cpu") {
        setMsg(`${prompt}Thinking…`);
        const my = genRef.current;
        setTimeout(() => {
          if (my === genRef.current) rollRef.current();
        }, 700);
      } else {
        setMsg(`${prompt}Tap your dice to roll.`);
      }
    },
    [saveGame]
  );

  const playToken = useCallback(
    async (i: number) => {
      const my = genRef.current;
      const g = {
        ...gameRef.current,
        pos: gameRef.current.pos.map((a) => a.slice()),
        ranks: gameRef.current.ranks.slice(),
      };
      const c = g.turn;
      const d = g.die ?? 1;
      const from = g.pos[c][i];

      setBusy(true);
      busyRef.current = true;
      setWaiting(null);
      waitingRef.current = null;

      if (from >= 0) {
        for (let p = from + 1; p < from + d; p++) {
          const hopState: LudoState = {
            ...g,
            pos: g.pos.map((a, idx) =>
              idx === c ? a.map((v, j) => (j === i ? p : v)) : a
            ),
          };
          setGame(hopState);
          setHopTok({ c, i });
          sfx.step();
          await sleep(80);
          setHopTok(null);
          await sleep(80);
          if (my !== genRef.current) return;
        }
      }

      const r = applyMove(g, i, d);
      setGame(g);
      gameRef.current = g;

      if (r.done && g.over) sfx.win();
      else if (r.hit.length) sfx.hit();
      else if (r.to === HOME) sfx.home();
      else sfx.step();

      await sleep(240);
      if (my !== genRef.current) return;

      let m = `${NAMES[c]} moved ${d}.`;
      if (r.to === HOME) m = `${NAMES[c]} got a token home.`;
      if (r.hit.length) m = `${NAMES[c]} captured ${NAMES[r.hit[0][0]]}!`;
      if (r.done) m = `${NAMES[c]} finished in place ${g.ranks.indexOf(c) + 1}.`;
      if (r.again) m += " Roll again.";
      beginTurn(g, m);
    },
    [beginTurn, sfx]
  );

  const rollDice = useCallback(async () => {
    if (busyRef.current || waitingRef.current || gameRef.current.over) return;
    const my = genRef.current;
    setBusy(true);
    busyRef.current = true;
    setMsg("Rolling…");

    const g: LudoState = {
      ...gameRef.current,
      pos: gameRef.current.pos.map((a) => a.slice()),
      ranks: gameRef.current.ranks.slice(),
    };
    const c = g.turn;
    setRollingIdx(c);

    for (let k = 0; k < 6; k++) {
      const f = 1 + ((Math.random() * 6) | 0);
      setDieFaces((prev) => prev.map((v, idx) => (idx === c ? f : v)));
      sfx.rattle();
      await sleep(70);
      if (my !== genRef.current) return;
    }

    setRollingIdx(null);
    const d = 1 + ((Math.random() * 6) | 0);
    g.die = d;
    g.sixes = d === 6 ? g.sixes + 1 : 0;
    setDieFaces((prev) => prev.map((v, idx) => (idx === c ? d : v)));
    setGame(g);
    gameRef.current = g;

    const name = NAMES[g.turn];
    const moves = g.sixes === 3 ? [] : legalMoves(g, d);

    if (!moves.length) {
      const why =
        g.sixes === 3
          ? `${name} rolled a third 6. Turn over.`
          : `${name} rolled ${d}. No move.`;
      setMsg(why);
      await sleep(1000);
      if (my !== genRef.current) return;
      if (d === 6 && g.sixes < 3) {
        beginTurn(g, why);
      } else {
        advanceTurn(g);
        setGame({ ...g });
        gameRef.current = g;
        beginTurn(g, why);
      }
      return;
    }

    const same = new Set(moves.map((i) => g.pos[g.turn][i])).size === 1;
    if (g.types[g.turn] === "cpu") {
      setMsg(`Rolled ${d}.`);
      await sleep(500);
      if (my !== genRef.current) return;
      playToken(chooseCpuMove(g, moves, d));
    } else if (same) {
      setMsg(`Rolled ${d}.`);
      await sleep(320);
      if (my !== genRef.current) return;
      playToken(moves[0]);
    } else {
      setBusy(false);
      busyRef.current = false;
      setWaiting(moves);
      waitingRef.current = moves;
      setMsg(`You rolled ${d}. Tap a highlighted token.`);
    }
  }, [beginTurn, playToken, sfx]);

  rollRef.current = rollDice;

  const loadGame = useCallback(
    (nextGame: LudoState) => {
      genRef.current++;
      setRollingIdx(null);
      setDieFaces([6, 6, 6, 6]);
      setSeats(nextGame.types);
      setShowSubmitModal(false);
      const fresh = { ...nextGame, die: null };
      setGame(fresh);
      gameRef.current = fresh;
      beginTurn(fresh);
    },
    [beginTurn]
  );

  useEffect(() => {
    try {
      setMuted(localStorage.getItem("egz-ludo-mute") === "1");
    } catch {}
    let saved: LudoState | null = null;
    try {
      const raw = localStorage.getItem("egz-ludo-v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.pos && parsed.types && !parsed.over) saved = parsed;
      }
    } catch {}
    loadGame(saved || createGame(["human", "cpu", "cpu", "cpu"]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group tokens that share the same visual spot so they don't overlap
  const tokenTransforms = useMemo(() => {
    const groups: Record<string, [number, number, number][]> = {};
    game.pos.forEach((ts, c) =>
      ts.forEach((p, i) => {
        const key = p < 0 || p === HOME ? `u${c}-${i}` : spot(c, i, p).join();
        (groups[key] = groups[key] || []).push([c, i, p]);
      })
    );
    const out: Record<string, { x: number; y: number; s: number }> = {};
    Object.values(groups).forEach((list) =>
      list.forEach(([c, i, p], k) => {
        let [x, y] = spot(c, i, p);
        let s = p === HOME ? 0.55 : 1;
        if (list.length > 1) {
          const cols = Math.ceil(Math.sqrt(list.length));
          const rows = Math.ceil(list.length / cols);
          x += ((k % cols) - (cols - 1) / 2) * (0.44 / (cols - 1 || 1));
          y += (Math.floor(k / cols) - (rows - 1) / 2) * (0.4 / (rows - 1 || 1));
          s = cols > 2 ? 0.5 : 0.65;
        }
        out[`${c}-${i}`] = { x: x * 100, y: y * 100, s };
      })
    );
    return out;
  }, [game.pos]);

  const invalidSeats = seats.filter((s) => s !== "off").length < 2;
  const isHumanWinner =
    game.over &&
    game.types.some((t) => t === "cpu") &&
    game.types[game.ranks[0]] === "human";

  const renderCorner = (c: number, flip: boolean) => {
    if (game.types[c] === "off") {
      return <div key={c} className="w-32 invisible" />;
    }
    const mine = c === game.turn && !game.over;
    const ready =
      mine && !busy && !waiting && game.types[game.turn] === "human";
    const hintText =
      game.types[c] === "cpu"
        ? "Computer"
        : ready
        ? "Tap to roll"
        : mine && waiting
        ? "Pick a token"
        : "";
    const pips = PIPS[dieFaces[c]] || PIPS[6];

    return (
      <div
        key={c}
        className={`flex items-center gap-2 font-semibold ${
          flip ? "flex-row-reverse text-right" : ""
        }`}
      >
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            unlockAudio();
            if (c === game.turn && game.types[c] === "human") rollDice();
          }}
          aria-label={`Roll ${NAMES[c]} dice`}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-4 bg-[#fdfcf7] p-0 transition-all cursor-pointer disabled:cursor-default ${
            mine ? "opacity-100 ring-2 ring-slate-900" : "opacity-40"
          } ${ready ? "animate-pulse" : ""}`}
          style={{ borderColor: COLORS[c] }}
        >
          <svg
            viewBox="0 0 90 90"
            className={`w-full h-full fill-[#262a44] ${
              rollingIdx === c ? "animate-spin" : ""
            }`}
          >
            {pips.map((k) => (
              <circle
                key={k}
                cx={22 + 23 * (k % 3)}
                cy={22 + 23 * Math.floor(k / 3)}
                r={8}
              />
            ))}
          </svg>
        </button>
        <div className="leading-tight">
          <div className="text-sm font-bold text-slate-900">{NAMES[c]}</div>
          <div className="text-[11px] font-medium text-slate-500 min-h-[14px]">
            {hintText}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        onPointerDown={unlockAudio}
        className="w-full flex flex-col lg:flex-row gap-5 items-start justify-center select-none"
      >
        {/* Board Column */}
        <div className="w-full max-w-[540px] mx-auto lg:mx-0 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            {renderCorner(0, false)}
            {renderCorner(1, true)}
          </div>

          <div className="relative w-full">
            <svg
              viewBox="0 0 1500 1500"
              role="group"
              aria-label="Ludo board"
              className="block w-full h-auto rounded-xl border border-slate-300 bg-[#fdfcf7] touch-manipulation"
            >
              {/* Base */}
              <rect
                x={0}
                y={0}
                width={1500}
                height={1500}
                fill="#fdfcf7"
                stroke="#262a44"
                strokeWidth={3}
              />

              {/* Yards */}
              {YARD.map(([x, y], c) => (
                <g key={`yard-${c}`}>
                  <rect
                    x={x * 100}
                    y={y * 100}
                    width={600}
                    height={600}
                    fill={COLORS[c]}
                    stroke="#262a44"
                    strokeWidth={3}
                  />
                  <rect
                    x={(x + 0.8) * 100}
                    y={(y + 0.8) * 100}
                    width={440}
                    height={440}
                    rx={50}
                    fill="#fdfcf7"
                    stroke="#262a44"
                    strokeWidth={3}
                  />
                  {yardSpots(c).map(([a, b], idx) => (
                    <circle
                      key={idx}
                      cx={a * 100}
                      cy={b * 100}
                      r={58}
                      fill={COLORS[c]}
                      opacity={0.3}
                    />
                  ))}
                </g>
              ))}

              {/* Track */}
              {TRACK.map(([x, y], i) => {
                const s = STARTS.indexOf(i);
                return (
                  <g key={`tr-${i}`}>
                    <rect
                      x={x * 100}
                      y={y * 100}
                      width={100}
                      height={100}
                      fill={s < 0 ? "#fdfcf7" : COLORS[s]}
                      stroke="#262a44"
                      strokeWidth={3}
                    />
                    {SAFE.includes(i) && (
                      <polygon
                        points={starPoints(x * 100 + 50, y * 100 + 50)}
                        fill={s < 0 ? "#a9adc4" : "#ffffff"}
                      />
                    )}
                  </g>
                );
              })}

              {/* Home Lanes */}
              {LANE.map((f, c) =>
                [0, 1, 2, 3, 4].map((k) => {
                  const [x, y] = f(k);
                  return (
                    <rect
                      key={`lane-${c}-${k}`}
                      x={x * 100}
                      y={y * 100}
                      width={100}
                      height={100}
                      fill={COLORS[c]}
                      stroke="#262a44"
                      strokeWidth={3}
                    />
                  );
                })
              )}

              {/* Center Finish */}
              {[
                "600,600 750,750 600,900",
                "600,600 900,600 750,750",
                "900,600 900,900 750,750",
                "600,900 750,750 900,900",
              ].map((pts, c) => (
                <polygon
                  key={`fin-${c}`}
                  points={pts}
                  fill={COLORS[c]}
                  stroke="#262a44"
                  strokeWidth={3}
                />
              ))}

              {/* Destination Hints */}
              {waiting?.map((i) => {
                const p = game.pos[game.turn][i];
                const to = p < 0 ? 0 : p + (game.die ?? 1);
                const [x, y] = spot(game.turn, i, to);
                return (
                  <circle
                    key={`hint-${i}`}
                    cx={x * 100}
                    cy={y * 100}
                    r={42}
                    fill="#ffffff"
                    fillOpacity={0.45}
                    stroke="#262a44"
                    strokeWidth={7}
                    strokeDasharray="14 10"
                    className="cursor-pointer"
                    onClick={() => playToken(i)}
                  />
                );
              })}

              {/* Tokens */}
              {NAMES.map((name, c) =>
                [0, 1, 2, 3].map((i) => {
                  if (game.types[c] === "off") return null;
                  const tf = tokenTransforms[`${c}-${i}`] || { x: 0, y: 0, s: 1 };
                  const canMove =
                    !!waiting && c === game.turn && waiting.includes(i);
                  const isHop = hopTok?.c === c && hopTok?.i === i;

                  return (
                    <g
                      key={`tok-${c}-${i}`}
                      transform={`translate(${tf.x}, ${tf.y}) scale(${tf.s})`}
                      className={`transition-transform duration-150 ease-out ${
                        canMove ? "cursor-pointer" : ""
                      }`}
                      onClick={() => {
                        if (canMove) playToken(i);
                      }}
                      role={canMove ? "button" : undefined}
                      tabIndex={canMove ? 0 : undefined}
                      aria-label={canMove ? `Move ${name} token ${i + 1}` : undefined}
                      onKeyDown={(e) => {
                        if (canMove && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          playToken(i);
                        }
                      }}
                    >
                      {canMove && (
                        <circle
                          r={56}
                          fill="none"
                          stroke="#262a44"
                          strokeWidth={9}
                          strokeDasharray="18 12"
                        />
                      )}
                      <ellipse cx={0} cy={30} rx={36} ry={13} fill="#000" opacity={0.25} />
                      <g
                        transform={isHop ? "translate(0, -34)" : undefined}
                        className="transition-transform duration-75"
                      >
                        <path
                          d="M-34 28C-30 10-14 4-12-10h24C14 4 30 10 34 28Q0 46-34 28Z"
                          fill={COLORS[c]}
                          stroke="#fff"
                          strokeWidth={7}
                        />
                        <circle
                          cy={-22}
                          r={23}
                          fill={COLORS[c]}
                          stroke="#fff"
                          strokeWidth={7}
                        />
                      </g>
                      <circle r={52} fill="transparent" />
                    </g>
                  );
                })
              )}
            </svg>

            {/* Win Overlay */}
            {game.over && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/70 rounded-xl p-4">
                <div className="bg-white rounded-2xl p-6 text-center shadow-2xl max-w-xs w-full border border-slate-200">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">
                    {NAMES[game.ranks[0]]} wins!
                  </h2>
                  <div className="text-sm text-slate-600 font-semibold space-y-1 mb-4">
                    {game.ranks.map((c, k) => (
                      <div key={c}>
                        {k + 1}. {NAMES[c]}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {isHumanWinner && (
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm cursor-pointer"
                      >
                        Save Score ({humanWinScore} pts)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => loadGame(createGame(game.types.slice()))}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            {renderCorner(3, false)}
            {renderCorner(2, true)}
          </div>
        </div>

        {/* Sidebar Controls */}
        <aside className="w-full lg:w-72 flex flex-col gap-3">
          {/* Turn Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-lg font-black text-slate-900">
              {game.over
                ? `${NAMES[game.ranks[0]]} wins!`
                : `${NAMES[game.turn]}${
                    game.types[game.turn] === "cpu" ? " (Computer)" : ""
                  }'s turn`}
            </div>
            <div className="text-sm text-slate-600 font-medium mt-0.5">{msg}</div>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              try {
                localStorage.setItem("egz-ludo-mute", next ? "1" : "0");
              } catch {}
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-sm text-slate-800 cursor-pointer"
          >
            Sound: {muted ? "Off" : "On"}
          </button>

          {/* Players Setup */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="font-black text-sm text-slate-900">Players</div>
            {NAMES.map((name, c) => (
              <label key={name} className="flex items-center gap-2.5 text-sm">
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: COLORS[c] }}
                />
                <span className="w-14 font-semibold text-slate-800">{name}</span>
                <select
                  value={seats[c]}
                  onChange={(e) => {
                    const next = seats.slice();
                    next[c] = e.target.value as SeatType;
                    setSeats(next);
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium text-sm"
                >
                  <option value="human">Person</option>
                  <option value="cpu">Computer</option>
                  <option value="off">Not playing</option>
                </select>
              </label>
            ))}
            <button
              type="button"
              disabled={invalidSeats}
              onClick={() => loadGame(createGame(seats.slice()))}
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm cursor-pointer"
            >
              {invalidSeats ? "Pick at least 2 players" : "Start New Game"}
            </button>
          </div>

          {/* Rules */}
          <details className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <summary className="font-black text-slate-900 cursor-pointer">Rules</summary>
            <ul className="mt-2 space-y-1 text-slate-600 list-disc pl-4">
              <li>Roll a 6 to bring a token out of the yard.</li>
              <li>A 6, a capture, or getting a token home earns another roll.</li>
              <li>Three 6s in a row ends your turn.</li>
              <li>Land on an opponent to send it back. Start and star squares are safe.</li>
              <li>You need the exact roll to reach home.</li>
            </ul>
          </details>
        </aside>
      </div>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={humanWinScore}
        gameId="ludo"
        onClose={() => setShowSubmitModal(false)}
      />
    </>
  );
}
