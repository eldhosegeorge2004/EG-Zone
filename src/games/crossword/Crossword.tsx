/* eslint-disable */
"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import SubmitScoreModal from "@/components/SubmitScoreModal";
import { computeTimeScore, fmtMMSS, getTodayStr, hashStr, rngFrom } from "@/lib/canvasGameUtils";

interface WordEntry {
  a: string;
  q: string;
}

interface PlacedWord extends WordEntry {
  r: number;
  c: number;
  dir: "across" | "down";
  n: number;
}

interface CellMeta {
  r: number;
  c: number;
  ch: string;
  ws: PlacedWord[];
  num?: number;
}

const BANK: WordEntry[] = `GAME:Something you play|COIN:Collect it for points|JUMP:Hop over a gap|BOSS:Tough end-of-level enemy|LIFE:What you lose when you fail|TIME:What the timer tracks|MAZE:Puzzle of twisting paths|DICE:Rolled for a random number|CARD:Part of a deck|STAR:Shines in the night sky|MOON:Orbits the Earth|RAIN:Falls from clouds|SNOW:Cold white flakes|WIND:Moves the leaves|FIRE:Hot and bright|LAVA:Molten rock|GOLD:Shiny yellow metal|KING:Rules a kingdom|HERO:Saves the day|TEAM:Group playing together|PATH:Trail to follow|GEMS:Sparkling stones|BLUE:Color of the sky|CAKE:Birthday treat|MILK:Dairy drink|RICE:Staple grain|SOUP:Eaten with a spoon|FISH:Swims in water|BIRD:Has wings and feathers|LION:King of the jungle|BEAR:Hibernating animal|FROG:Hops and croaks|DUCK:Quacks|BOAT:Floats on water|ROAD:Cars drive on it|DOOR:You open it to enter|BOOK:Has pages to read|SONG:Sung tune|DRUM:Beaten for rhythm|BELL:Rings|ARROW:Shot from a bow|BLOCK:Square piece in a puzzle|CHESS:Board game with kings and queens|CLOCK:Tells the time|CLOUD:Floats in the sky|CROWN:A king wears it|DANCE:Move to music|FLAME:Fire's tongue|GHOST:Spooky spirit|GRAPE:Wine fruit|HEART:Pumps blood|JOKER:Wild card|LEMON:Sour yellow fruit|LASER:Beam of focused light|MAGIC:Wizard's craft|MOUSE:Clicks on a desktop|MUSIC:Played on instruments|NIGHT:When the moon is out|OCEAN:Huge body of salt water|PIANO:Instrument with black and white keys|PIXEL:Tiny dot on a screen|PLANT:Grows from a seed|QUEEN:Powerful chess piece|QUEST:Hero's mission|RADIO:Plays broadcasts|ROBOT:Metal machine helper|SHEEP:Gives wool|SMILE:Happy expression|SNAKE:Slithering reptile|SPACE:Final frontier|STORM:Thunder and lightning|SWORD:Knight's blade|TIGER:Striped big cat|TOWER:Tall narrow building|TRAIN:Runs on rails|WATER:H2O|WORLD:The whole planet|ZEBRA:Striped horse|PIZZA:Cheesy slice|BREAD:Baked loaf|CANDY:Sweet treat|PEACH:Fuzzy fruit|APPLE:Keeps the doctor away|MANGO:Tropical fruit|STONE:Rock|BEACH:Sandy shore|RIVER:Flowing water|HORSE:Rides with a saddle|EAGLE:Soaring bird of prey|PANDA:Bamboo-eating bear|SHARK:Fin in the ocean|WHALE:Largest sea mammal|ARCADE:Place full of game machines|BUTTON:Pressed on a controller|CASTLE:Fort with towers|DRAGON:Fire-breathing beast|GARDEN:Place for flowers|GOLDEN:Made of gold|JOYPAD:Game controller|KNIGHT:Armored rider|PLAYER:Person in a game|PUZZLE:Brain teaser|ROCKET:Launches into space|SPRITE:2D game character|TICKET:Entry pass|TROPHY:Prize cup|WIZARD:Casts spells|ZOMBIE:Undead walker|ORANGE:Citrus fruit|BANANA:Yellow fruit|MONKEY:Swings through trees|TURTLE:Slow with a shell|BRIDGE:Crosses a river|FOREST:Many trees|PLANET:Orbits a star|SILVER:Second place medal|MARBLE:Small glass ball|CANDLE:Wax with a flame|SUMMER:Hottest season|WINTER:Coldest season|COOKIE:Chocolate chip treat|BUBBLE:Floating soap sphere|SPIDER:Eight-legged web spinner|PIRATE:Sea robber|DOCTOR:Helps the sick|PENCIL:Writes in graphite|CIRCLE:Round shape|SQUARE:Four equal sides|TARGET:Aim at it|SHIELD:Blocks attacks|SWITCH:Flips on and off|STREAM:Small river|GUITAR:Strummed instrument|RABBIT:Hops and has long ears`
  .split("|")
  .map((s) => {
    const [a, q] = s.split(":");
    return { a: a.trim(), q: q.trim() };
  });

const MAXD = 9;
const TARGET = 8;
const PENALTY = 15;

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface GridLetter {
  ch: string;
  r: number;
  c: number;
  dirs: Set<"across" | "down">;
}

function fits(
  word: string,
  r: number,
  c: number,
  dir: "across" | "down",
  L: Map<string, GridLetter>
): boolean {
  const dr = dir === "down" ? 1 : 0;
  const dc = 1 - dr;
  const n = word.length;
  if (L.has(`${r - dr},${c - dc}`) || L.has(`${r + dr * n},${c + dc * n}`)) return false;
  let cross = 0;
  for (let i = 0; i < n; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    const e = L.get(`${rr},${cc}`);
    if (e) {
      if (e.ch !== word[i] || e.dirs.has(dir)) return false;
      cross++;
    } else if (L.has(`${rr + dc},${cc + dr}`) || L.has(`${rr - dc},${cc - dr}`)) {
      return false;
    }
  }
  return cross > 0;
}

function generateCrossword(seed: number): { words: PlacedWord[]; rows: number; cols: number } {
  const rnd = rngFrom(seed);
  let best: {
    score: number;
    placed: Omit<PlacedWord, "n">[];
    r0: number;
    c0: number;
    rows: number;
    cols: number;
  } | null = null;

  for (let t = 0; t < 40; t++) {
    const order = shuffle(BANK, rnd);
    const L = new Map<string, GridLetter>();
    const placed: Omit<PlacedWord, "n">[] = [];
    let r0 = 0,
      r1 = 0,
      c0 = 0,
      c1 = 0;

    const put = (w: WordEntry, r: number, c: number, dir: "across" | "down") => {
      const dr = dir === "down" ? 1 : 0;
      const dc = 1 - dr;
      [...w.a].forEach((ch, i) => {
        const rr = r + dr * i;
        const cc = c + dc * i;
        const k = `${rr},${cc}`;
        const e = L.get(k);
        if (e) e.dirs.add(dir);
        else L.set(k, { ch, r: rr, c: cc, dirs: new Set([dir]) });
      });
      placed.push({ a: w.a, q: w.q, r, c, dir });
      r0 = Math.min(r0, r);
      c0 = Math.min(c0, c);
      r1 = Math.max(r1, r + dr * (w.a.length - 1));
      c1 = Math.max(c1, c + dc * (w.a.length - 1));
    };

    put(order[0], 0, 0, "across");
    for (const w of order.slice(1)) {
      if (placed.length >= TARGET) break;
      const cands: [number, number, "across" | "down"][] = [];
      for (const e of L.values()) {
        if (e.dirs.size !== 1) continue;
        const dir: "across" | "down" = e.dirs.has("across") ? "down" : "across";
        const dr = dir === "down" ? 1 : 0;
        for (let i = 0; i < w.a.length; i++) {
          if (w.a[i] === e.ch) cands.push([e.r - dr * i, e.c - (1 - dr) * i, dir]);
        }
      }
      for (const [r, c, dir] of shuffle(cands, rnd)) {
        const dr = dir === "down" ? 1 : 0;
        const n = w.a.length;
        if (
          Math.max(r1, r + dr * (n - 1)) - Math.min(r0, r) + 1 > MAXD ||
          Math.max(c1, c + (1 - dr) * (n - 1)) - Math.min(c0, c) + 1 > MAXD
        ) {
          continue;
        }
        if (fits(w.a, r, c, dir, L)) {
          put(w, r, c, dir);
          break;
        }
      }
    }
    const rows = r1 - r0 + 1;
    const cols = c1 - c0 + 1;
    const score = placed.length * 100 - rows * cols;
    if (!best || score > best.score) best = { score, placed, r0, c0, rows, cols };
  }

  const finalBest = best!;
  const words: PlacedWord[] = finalBest.placed.map((p) => ({
    ...p,
    r: p.r - finalBest.r0,
    c: p.c - finalBest.c0,
    n: 0,
  }));
  const starts = [...new Set(words.map((w) => `${w.r},${w.c}`))].sort((x, y) => {
    const [a, b] = x.split(",").map(Number);
    const [c, d] = y.split(",").map(Number);
    return a - c || b - d;
  });
  words.forEach((w) => {
    w.n = starts.indexOf(`${w.r},${w.c}`) + 1;
  });
  return { words, rows: finalBest.rows, cols: finalBest.cols };
}

function wordCells(w: PlacedWord): string[] {
  return [...w.a].map((_, i) =>
    w.dir === "down" ? `${w.r + i},${w.c}` : `${w.r},${w.c + i}`
  );
}

export default function Crossword() {
  const [mode, setMode] = useState<"daily" | "random">("daily");
  const [seed, setSeed] = useState<number>(() => hashStr(`EGZ-${getTodayStr()}`));
  const [dateStr, setDateStr] = useState<string>(() => getTodayStr());
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [secs, setSecs] = useState(0);
  const [bestSecs, setBestSecs] = useState<number | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [badCells, setBadCells] = useState<Record<string, boolean>>({});
  const [cur, setCur] = useState<string>("");
  const [dir, setDir] = useState<"across" | "down">("across");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [winBanner, setWinBanner] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const puzzle = useMemo(() => generateCrossword(seed), [seed]);

  const cellMap = useMemo(() => {
    const map: Record<string, CellMeta> = {};
    puzzle.words.forEach((w) => {
      [...w.a].forEach((ch, k) => {
        const r = w.r + (w.dir === "down" ? k : 0);
        const c = w.c + (w.dir === "across" ? k : 0);
        const id = `${r},${c}`;
        if (!map[id]) {
          map[id] = { r, c, ch, ws: [] };
        }
        map[id].ws.push(w);
      });
    });
    puzzle.words.forEach((w) => {
      const id = `${w.r},${w.c}`;
      if (map[id]) map[id].num = w.n;
    });
    return map;
  }, [puzzle]);

  const bestKey = useCallback(
    (m: "daily" | "random", d: string) =>
      m === "daily" ? `egz-cw-best-${d}` : "egz-cw-best-random",
    []
  );

  const loadPuzzle = useCallback(
    (m: "daily" | "random", fresh = true) => {
      const d = getTodayStr();
      setDateStr(d);
      setMode(m);
      if (m === "daily") {
        setSeed(hashStr(`EGZ-${d}`));
      } else if (fresh || m !== mode) {
        setSeed(Math.floor(Math.random() * 4294967295));
      }
      setStarted(false);
      setDone(false);
      setSolved(false);
      setRevealed(false);
      setSecs(0);
      setValues({});
      setBadCells({});
      setWinBanner(null);
      setShowSubmitModal(false);
      try {
        const b = localStorage.getItem(bestKey(m, d));
        setBestSecs(b ? Number(b) : null);
      } catch {
        setBestSecs(null);
      }
    },
    [bestKey, mode]
  );

  useEffect(() => {
    const firstWord = puzzle.words[0];
    if (firstWord) {
      setCur(`${firstWord.r},${firstWord.c}`);
      setDir(firstWord.dir);
    }
  }, [puzzle]);

  useEffect(() => {
    try {
      const b = localStorage.getItem(bestKey(mode, dateStr));
      setBestSecs(b ? Number(b) : null);
    } catch {}
  }, [bestKey, mode, dateStr]);

  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, done]);

  const activeWord = useMemo(() => {
    const meta = cellMap[cur];
    if (!meta) return puzzle.words[0];
    return meta.ws.find((w) => w.dir === dir) || meta.ws[0];
  }, [cellMap, cur, dir, puzzle.words]);

  const highlightSet = useMemo(() => {
    if (!activeWord) return new Set<string>();
    return new Set(wordCells(activeWord));
  }, [activeWord]);

  const selectCell = (id: string, toggle = false, focus = true) => {
    const meta = cellMap[id];
    if (!meta) return;
    setCur(id);
    if (toggle && meta.ws.length > 1) {
      setDir((prev) => (prev === "across" ? "down" : "across"));
    } else if (!meta.ws.some((w) => w.dir === dir)) {
      setDir(meta.ws[0].dir);
    }
    if (focus) {
      setTimeout(() => inputRefs.current[id]?.focus(), 0);
    }
  };

  const checkWin = (nextVals: Record<string, string>) => {
    if (done) return;
    const allCorrect = Object.entries(cellMap).every(
      ([id, meta]) => nextVals[id] === meta.ch
    );
    if (!allCorrect) return;

    setDone(true);
    setSolved(true);
    const key = bestKey(mode, dateStr);
    let prev: number | null = null;
    try {
      const b = localStorage.getItem(key);
      if (b) prev = Number(b);
    } catch {}
    const isRecord = prev === null || secs < prev;
    if (isRecord) {
      try {
        localStorage.setItem(key, String(secs));
      } catch {}
      setBestSecs(secs);
    }
    setWinBanner(`Solved in ${fmtMMSS(secs)}${isRecord ? " — New Best!" : "!"}`);
    setTimeout(() => setShowSubmitModal(true), 600);
  };

  const step = (delta: number, clearPrev = false, currentId = cur, nextVals = values) => {
    if (!activeWord) return;
    const list = wordCells(activeWord);
    const idx = list.indexOf(currentId) + delta;
    if (idx < 0 || idx >= list.length) return;
    const targetId = list[idx];
    if (clearPrev) {
      const updated = { ...nextVals, [targetId]: "" };
      setValues(updated);
      setBadCells((b) => ({ ...b, [targetId]: false }));
    }
    selectCell(targetId, false, true);
  };

  const moveGrid = (dr: number, dc: number, d: "across" | "down") => {
    const meta = cellMap[cur];
    if (!meta) return;
    const nid = `${meta.r + dr},${meta.c + dc}`;
    if (cellMap[nid]) {
      setDir(d);
      selectCell(nid, false, true);
    }
  };

  const handleHint = () => {
    if (done || !cur || !cellMap[cur]) return;
    if (!started) setStarted(true);
    const meta = cellMap[cur];
    const nextVals = { ...values };
    if (nextVals[cur] !== meta.ch) {
      nextVals[cur] = meta.ch;
      setValues(nextVals);
      setSecs((s) => s + PENALTY);
    }
    setBadCells((b) => ({ ...b, [cur]: false }));
    step(1, false, cur, nextVals);
    checkWin(nextVals);
  };

  const handleCheck = () => {
    const nextBad: Record<string, boolean> = {};
    Object.entries(cellMap).forEach(([id, meta]) => {
      if (values[id] && values[id] !== meta.ch) {
        nextBad[id] = true;
      }
    });
    setBadCells(nextBad);
  };

  const handleReveal = () => {
    const nextVals: Record<string, string> = {};
    Object.entries(cellMap).forEach(([id, meta]) => {
      nextVals[id] = meta.ch;
    });
    setValues(nextVals);
    setBadCells({});
    setDone(true);
    setRevealed(true);
    setWinBanner("Answers revealed. Try a new puzzle!");
  };

  const acrossWords = useMemo(
    () => puzzle.words.filter((w) => w.dir === "across").sort((a, b) => a.n - b.n),
    [puzzle.words]
  );
  const downWords = useMemo(
    () => puzzle.words.filter((w) => w.dir === "down").sort((a, b) => a.n - b.n),
    [puzzle.words]
  );

  const computedScore = computeTimeScore(secs, 1200, 3);

  return (
    <>
      <div className="w-full max-w-2xl mx-auto select-none">
        {/* Top HUD */}
        <div className="grid grid-cols-3 gap-2 p-3 mb-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div>
            <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Mode
            </span>
            <b className="text-sm sm:text-base font-extrabold text-slate-900">
              {mode === "daily" ? `Daily (${dateStr})` : "Random"}
            </b>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Time
            </span>
            <b className="text-xl font-mono font-extrabold text-indigo-600">
              {fmtMMSS(secs)}
            </b>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Best
            </span>
            <b className="text-xl font-mono font-extrabold text-slate-900">
              {bestSecs !== null ? fmtMMSS(bestSecs) : "--:--"}
            </b>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => loadPuzzle("daily")}
            className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-colors cursor-pointer ${
              mode === "daily"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Daily Puzzle
          </button>
          <button
            type="button"
            onClick={() => loadPuzzle("random", true)}
            className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-colors cursor-pointer ${
              mode === "random"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Random Puzzle
          </button>
        </div>

        {!started ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-slate-700 font-semibold mb-4">
              Fill in the interlocking grid using the Across and Down clues. Hints add a 15-second penalty.
            </p>
            <button
              type="button"
              onClick={() => {
                setStarted(true);
                setTimeout(() => inputRefs.current[cur]?.focus(), 50);
              }}
              className="w-full max-w-xs py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-colors cursor-pointer"
            >
              Start Crossword
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Clue Banner */}
            {activeWord && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold text-sm sm:text-base text-center">
                {activeWord.n} {activeWord.dir === "across" ? "Across" : "Down"}: {activeWord.q}
              </div>
            )}

            {/* Win / Reveal Banner */}
            {winBanner && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <p className="font-black text-emerald-800 text-lg">{winBanner}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {solved && !revealed && (
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm cursor-pointer"
                    >
                      Save Score ({computedScore} pts)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => loadPuzzle("random", true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer"
                  >
                    New Random Puzzle
                  </button>
                </div>
              </div>
            )}

            {/* Crossword Grid */}
            <div
              className="grid gap-1 mx-auto bg-slate-900 p-1.5 rounded-xl"
              style={{
                gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
                maxWidth: `${Math.min(400, puzzle.cols * 46)}px`,
              }}
            >
              {Array.from({ length: puzzle.rows }).map((_, r) =>
                Array.from({ length: puzzle.cols }).map((__, c) => {
                  const id = `${r},${c}`;
                  const meta = cellMap[id];
                  if (!meta) {
                    return <div key={id} className="aspect-square bg-slate-900 rounded-sm" />;
                  }
                  const isCur = cur === id;
                  const isHl = !isCur && highlightSet.has(id);
                  const isBad = badCells[id];

                  return (
                    <div
                      key={id}
                      onClick={() => selectCell(id, cur === id)}
                      className={`relative aspect-square rounded-sm border transition-colors ${
                        isCur
                          ? "bg-amber-200 border-amber-500"
                          : isHl
                          ? "bg-indigo-100 border-indigo-300"
                          : isBad
                          ? "bg-rose-100 border-rose-400"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {meta.num && (
                        <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-bold text-slate-500 pointer-events-none leading-none">
                          {meta.num}
                        </span>
                      )}
                      <input
                        ref={(el) => {
                          inputRefs.current[id] = el;
                        }}
                        value={values[id] || ""}
                        readOnly={done}
                        maxLength={2}
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        aria-label={`Row ${r + 1} column ${c + 1}`}
                        onChange={(e) => {
                          if (done) return;
                          const v = e.target.value.replace(/[^a-z]/gi, "").slice(-1).toUpperCase();
                          const nextVals = { ...values, [id]: v };
                          setValues(nextVals);
                          setBadCells((b) => ({ ...b, [id]: false }));
                          if (v) step(1, false, id, nextVals);
                          checkWin(nextVals);
                        }}
                        onKeyDown={(e) => {
                          if (done) return;
                          if (e.key === "Backspace" && !values[id]) {
                            e.preventDefault();
                            step(-1, true, id, values);
                          } else if (e.key === "ArrowRight") {
                            e.preventDefault();
                            moveGrid(0, 1, "across");
                          } else if (e.key === "ArrowLeft") {
                            e.preventDefault();
                            moveGrid(0, -1, "across");
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            moveGrid(1, 0, "down");
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            moveGrid(-1, 0, "down");
                          }
                        }}
                        className="w-full h-full bg-transparent text-center font-black text-base sm:text-lg text-slate-900 outline-none uppercase pt-1.5 caret-transparent cursor-pointer"
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleCheck}
                disabled={done}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Check
              </button>
              <button
                type="button"
                onClick={handleHint}
                disabled={done}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-900 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Hint (+15s)
              </button>
              <button
                type="button"
                onClick={handleReveal}
                disabled={done}
                className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 disabled:opacity-50 text-rose-900 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Reveal
              </button>
              <button
                type="button"
                onClick={() => loadPuzzle(mode, false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Clues */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Across
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {acrossWords.map((w) => {
                    const isOn = activeWord?.n === w.n && activeWord?.dir === "across";
                    return (
                      <li
                        key={`a-${w.n}`}
                        onClick={() => {
                          setDir("across");
                          selectCell(`${w.r},${w.c}`, false, true);
                        }}
                        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                          isOn ? "bg-indigo-100 text-indigo-950 font-bold" : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="font-black mr-1.5">{w.n}.</span>
                        {w.q}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Down
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {downWords.map((w) => {
                    const isOn = activeWord?.n === w.n && activeWord?.dir === "down";
                    return (
                      <li
                        key={`d-${w.n}`}
                        onClick={() => {
                          setDir("down");
                          selectCell(`${w.r},${w.c}`, false, true);
                        }}
                        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                          isOn ? "bg-indigo-100 text-indigo-950 font-bold" : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="font-black mr-1.5">{w.n}.</span>
                        {w.q}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={computedScore}
        gameId="crossword"
        onClose={() => setShowSubmitModal(false)}
      />
    </>
  );
}
