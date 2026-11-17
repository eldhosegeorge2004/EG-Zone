/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface WordDef {
  word: string;
  dir: "across" | "down";
  r: number;
  c: number;
  clue: string;
  num?: number;
}

interface PuzzleData {
  id: number;
  title: string;
  theme: string;
  words: WordDef[];
}

const PUZZLES: PuzzleData[] = [
  {
    id: 1,
    title: "Puzzle 1",
    theme: "Nature & Technology",
    words: [
      { word: "ROBOT", dir: "down", r: 0, c: 3, clue: "Programmable mechanical assistant capable of complex actions" },
      { word: "WATER", dir: "down", r: 1, c: 5, clue: "Clear liquid essential for all known living organisms" },
      { word: "FLAME", dir: "down", r: 1, c: 8, clue: "Hot glowing visible gas ignited in a fire" },
      { word: "APPLE", dir: "across", r: 2, c: 5, clue: "Crisp red or green orchard fruit loved worldwide" },
      { word: "FROST", dir: "across", r: 3, c: 1, clue: "Thin layer of icy white crystals formed on cold surfaces" },
      { word: "LASER", dir: "down", r: 4, c: 0, clue: "Intense focused beam of coherent light amplification" },
      { word: "BRAVE", dir: "across", r: 5, c: 4, clue: "Possessing courage and ready to face adversity" },
      { word: "BREAD", dir: "down", r: 5, c: 4, clue: "Staple baked food prepared from dough of flour and water" },
      { word: "SOLAR", dir: "across", r: 6, c: 0, clue: "Relating to or energy harnessed directly from the Sun" },
      { word: "DREAM", dir: "across", r: 9, c: 4, clue: "Visions and sensations passing through the mind during sleep" },
    ],
  },
  {
    id: 2,
    title: "Puzzle 2",
    theme: "Earth & Elements",
    words: [
      { word: "PEACE", dir: "down", r: 0, c: 1, clue: "State of tranquility, freedom from war and violence" },
      { word: "DREAM", dir: "down", r: 0, c: 3, clue: "Subconscious fantasies and visions while sleeping" },
      { word: "OCEAN", dir: "down", r: 0, c: 9, clue: "Vast continuous expanse of salt water covering Earth" },
      { word: "EARTH", dir: "across", r: 1, c: 1, clue: "Our blue home planet, the third sphere from the Sun" },
      { word: "HEART", dir: "down", r: 1, c: 5, clue: "Muscular chest organ tirelessly pumping blood" },
      { word: "EAGLE", dir: "across", r: 2, c: 5, clue: "Soaring predatory bird renowned for keen eyesight" },
      { word: "STORM", dir: "across", r: 5, c: 4, clue: "Violent weather tempest with howling winds and thunder" },
      { word: "MUSIC", dir: "down", r: 5, c: 8, clue: "Artful harmony, melody, and expressive rhythm" },
      { word: "FROST", dir: "across", r: 7, c: 5, clue: "Delicate ice glaze covering freezing winter mornings" },
      { word: "CLOCK", dir: "across", r: 9, c: 5, clue: "Precision timekeeping instrument marking passing hours" },
    ],
  },
  {
    id: 3,
    title: "Puzzle 3",
    theme: "Cosmos & Wildlife",
    words: [
      { word: "GRACE", dir: "down", r: 0, c: 3, clue: "Elegance of movement, composure, or divine favor" },
      { word: "BRAVE", dir: "across", r: 1, c: 2, clue: "Showing no fear when facing challenging obstacles" },
      { word: "BREAD", dir: "down", r: 2, c: 7, clue: "Nourishing oven-baked loaf made from yeast and grain" },
      { word: "EARTH", dir: "across", r: 3, c: 5, clue: "Terrestrial world inhabited by all humanity" },
      { word: "LEMON", dir: "down", r: 4, c: 0, clue: "Bright yellow citrus fruit packed with sour juice" },
      { word: "STONE", dir: "down", r: 4, c: 2, clue: "Hard durable solid mineral rock formed over millennia" },
      { word: "ROBOT", dir: "down", r: 4, c: 4, clue: "Automated electronic system engineered to perform tasks" },
      { word: "LASER", dir: "across", r: 4, c: 0, clue: "Narrow optical beam used in medicine, tech, and sci-fi" },
      { word: "OCEAN", dir: "across", r: 5, c: 4, clue: "Enormous saltwater body where marine creatures thrive" },
      { word: "TIGER", dir: "across", r: 8, c: 4, clue: "Striped jungle predator roaming the wilds of Asia" },
    ],
  },
];

// Helper to assign numbers to words like real crosswords
function numberWords(words: WordDef[]): WordDef[] {
  const map: { [key: string]: number } = {};
  let nextNum = 1;
  const sorted = [...words].sort((a, b) => a.r - b.r || a.c - b.c);
  sorted.forEach((w) => {
    const key = `${w.r},${w.c}`;
    if (!map[key]) {
      map[key] = nextNum++;
    }
  });
  return words.map((w) => ({
    ...w,
    num: map[`${w.r},${w.c}`],
  }));
}

export default function Crossword() {
  const [selectedPuzzleIdx, setSelectedPuzzleIdx] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array.from({ length: 10 }, () => Array(10).fill(""))
  );
  const [checked, setChecked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [bestScores, setBestScores] = useState<{ [key: number]: number }>({});

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playChime = useCallback(
    (type: "click" | "correct" | "win" | "hint" | "error") => {
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "click") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(400, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (type === "hint") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === "error") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.setValueAtTime(180, now + 0.1);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === "correct") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === "win") {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.setValueAtTime(freq, now + idx * 0.12);
            g.gain.setValueAtTime(0.1, now + idx * 0.12);
            g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
            o.start(now + idx * 0.12);
            o.stop(now + idx * 0.12 + 0.3);
          });
        }
      } catch {}
    },
    [getAudioContext]
  );

  const currentPuzzle = PUZZLES[selectedPuzzleIdx];
  const numberedWords = numberWords(currentPuzzle.words);

  // Compute solution grid
  const solutionGrid = useRef<string[][]>(Array.from({ length: 10 }, () => Array(10).fill("")));
  const cellNumberMap = useRef<{ [key: string]: number }>({});
  const activeCells = useRef<boolean[][]>(Array.from({ length: 10 }, () => Array(10).fill(false)));

  // Rebuild grid metadata when puzzle changes
  useEffect(() => {
    const sol = Array.from({ length: 10 }, () => Array(10).fill(""));
    const numMap: { [key: string]: number } = {};
    const active = Array.from({ length: 10 }, () => Array(10).fill(false));

    numberedWords.forEach((w) => {
      numMap[`${w.r},${w.c}`] = w.num!;
      for (let i = 0; i < w.word.length; i++) {
        const r = w.dir === "across" ? w.r : w.r + i;
        const c = w.dir === "across" ? w.c + i : w.c;
        sol[r][c] = w.word[i];
        active[r][c] = true;
      }
    });

    solutionGrid.current = sol;
    cellNumberMap.current = numMap;
    activeCells.current = active;
    setUserGrid(Array.from({ length: 10 }, () => Array(10).fill("")));
    setSelectedCell(null);
    setChecked(false);
    setIsCompleted(false);
    setHintsUsed(0);
    setTimerSeconds(0);
    setIsActive(true);
  }, [selectedPuzzleIdx]);

  // Load high scores
  useEffect(() => {
    try {
      const saved = localStorage.getItem("crossword_highscores");
      if (saved) {
        setBestScores(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Timer
  useEffect(() => {
    if (!isActive || isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, isCompleted]);

  // Find currently active word based on selected cell & direction
  const activeWord = numberedWords.find((w) => {
    if (!selectedCell) return false;
    if (w.dir !== direction) return false;
    if (w.dir === "across") {
      return (
        w.r === selectedCell.r &&
        selectedCell.c >= w.c &&
        selectedCell.c < w.c + w.word.length
      );
    } else {
      return (
        w.c === selectedCell.c &&
        selectedCell.r >= w.r &&
        selectedCell.r < w.r + w.word.length
      );
    }
  }) ||
  // Fallback to opposite direction if active in cell
  numberedWords.find((w) => {
    if (!selectedCell) return false;
    if (w.dir === "across") {
      return (
        w.r === selectedCell.r &&
        selectedCell.c >= w.c &&
        selectedCell.c < w.c + w.word.length
      );
    } else {
      return (
        w.c === selectedCell.c &&
        selectedCell.r >= w.r &&
        selectedCell.r < w.r + w.word.length
      );
    }
  });

  const handleCellClick = (r: number, c: number) => {
    if (!activeCells.current[r][c]) return;
    playChime("click");
    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
      // Toggle direction if cell belongs to both across and down
      setDirection((prev) => (prev === "across" ? "down" : "across"));
    } else {
      setSelectedCell({ r, c });
    }
  };

  const advanceCell = useCallback(
    (current: { r: number; c: number }, dir: "across" | "down") => {
      let nextR = current.r;
      let nextC = current.c;
      if (dir === "across") {
        nextC += 1;
      } else {
        nextR += 1;
      }
      if (nextR < 10 && nextC < 10 && activeCells.current[nextR][nextC]) {
        setSelectedCell({ r: nextR, c: nextC });
      }
    },
    []
  );

  const retreatCell = useCallback(
    (current: { r: number; c: number }, dir: "across" | "down") => {
      let prevR = current.r;
      let prevC = current.c;
      if (dir === "across") {
        prevC -= 1;
      } else {
        prevR -= 1;
      }
      if (prevR >= 0 && prevC >= 0 && activeCells.current[prevR][prevC]) {
        setSelectedCell({ r: prevR, c: prevC });
      }
    },
    []
  );

  const handleInputLetter = useCallback(
    (letter: string) => {
      if (!selectedCell || isCompleted) return;
      playChime("click");
      const { r, c } = selectedCell;
      const upper = letter.toUpperCase();

      setUserGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = upper;
        return next;
      });

      advanceCell(selectedCell, direction);
    },
    [selectedCell, isCompleted, direction, advanceCell, playChime]
  );

  const handleBackspace = useCallback(() => {
    if (!selectedCell || isCompleted) return;
    playChime("click");
    const { r, c } = selectedCell;

    if (userGrid[r][c] !== "") {
      setUserGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = "";
        return next;
      });
    } else {
      retreatCell(selectedCell, direction);
      setUserGrid((prev) => {
        const next = prev.map((row) => [...row]);
        const targetR = direction === "across" ? r : r - 1;
        const targetC = direction === "across" ? c - 1 : c;
        if (targetR >= 0 && targetC >= 0 && activeCells.current[targetR][targetC]) {
          next[targetR][targetC] = "";
        }
        return next;
      });
    }
  }, [selectedCell, isCompleted, userGrid, direction, retreatCell, playChime]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleInputLetter(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setDirection("across");
        if (selectedCell && selectedCell.c + 1 < 10 && activeCells.current[selectedCell.r][selectedCell.c + 1]) {
          setSelectedCell({ r: selectedCell.r, c: selectedCell.c + 1 });
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setDirection("across");
        if (selectedCell && selectedCell.c - 1 >= 0 && activeCells.current[selectedCell.r][selectedCell.c - 1]) {
          setSelectedCell({ r: selectedCell.r, c: selectedCell.c - 1 });
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setDirection("down");
        if (selectedCell && selectedCell.r + 1 < 10 && activeCells.current[selectedCell.r + 1][selectedCell.c]) {
          setSelectedCell({ r: selectedCell.r + 1, c: selectedCell.c });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setDirection("down");
        if (selectedCell && selectedCell.r - 1 >= 0 && activeCells.current[selectedCell.r - 1][selectedCell.c]) {
          setSelectedCell({ r: selectedCell.r - 1, c: selectedCell.c });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, isCompleted, handleInputLetter, handleBackspace]);

  // Validate entire board
  const checkPuzzle = () => {
    setChecked(true);
    let allCorrect = true;
    let correctCount = 0;
    let totalActive = 0;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (activeCells.current[r][c]) {
          totalActive++;
          if (userGrid[r][c] === solutionGrid.current[r][c]) {
            correctCount++;
          } else {
            allCorrect = false;
          }
        }
      }
    }

    if (allCorrect && totalActive > 0) {
      setIsCompleted(true);
      playChime("win");
      // Calculate score: 1000 - time - hints penalty
      const score = Math.max(100, 1500 - timerSeconds * 3 - hintsUsed * 100);
      setBestScores((prev) => {
        const currentBest = prev[currentPuzzle.id] || 0;
        const newBest = Math.max(currentBest, score);
        const updated = { ...prev, [currentPuzzle.id]: newBest };
        try {
          localStorage.setItem("crossword_highscores", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      playChime("error");
    }
  };

  // Reveal a letter (hint)
  const revealLetter = () => {
    if (!selectedCell || isCompleted) return;
    const { r, c } = selectedCell;
    const correctLetter = solutionGrid.current[r][c];
    if (!correctLetter) return;

    playChime("hint");
    setHintsUsed((prev) => prev + 1);
    setUserGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = correctLetter;
      return next;
    });
    advanceCell(selectedCell, direction);
  };

  const selectWord = (w: WordDef) => {
    setSelectedCell({ r: w.r, c: w.c });
    setDirection(w.dir);
    playChime("click");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md max-w-4xl mx-auto">
      {/* Title & Level Selection Bar */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-indigo-500">
            Crossword Lite
          </h1>
          <p className="text-xs text-slate-400">
            {currentPuzzle.theme} • 10×10 Grid
          </p>
        </div>

        {/* Puzzle Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl">
          {PUZZLES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedPuzzleIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPuzzleIdx === idx
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Time</span>
          <span className="text-lg font-mono font-bold text-blue-400">{formatTime(timerSeconds)}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Hints Used</span>
          <span className="text-lg font-mono font-bold text-amber-400">{hintsUsed}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Best Score</span>
          <span className="text-lg font-mono font-bold text-emerald-400">{bestScores[currentPuzzle.id] || "—"}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Words</span>
          <span className="text-lg font-mono font-bold text-indigo-400">{currentPuzzle.words.length}</span>
        </div>
      </div>

      {/* Main Game Area: Grid + Clues */}
      <div className="w-full flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* 10x10 Crossword Grid */}
        <div className="flex flex-col items-center mx-auto">
          <div className="grid grid-cols-10 gap-1 bg-slate-950 p-2 md:p-3 rounded-xl border-2 border-slate-700 shadow-inner">
            {Array.from({ length: 10 }).map((_, r) =>
              Array.from({ length: 10 }).map((_, c) => {
                const isActiveCell = activeCells.current[r][c];
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                const cellLetter = userGrid[r][c];
                const isCorrect = checked && cellLetter === solutionGrid.current[r][c];
                const isWrong = checked && cellLetter !== "" && cellLetter !== solutionGrid.current[r][c];

                // Check if in active selected word
                let isInActiveWord = false;
                if (activeWord) {
                  if (activeWord.dir === "across") {
                    isInActiveWord =
                      r === activeWord.r && c >= activeWord.c && c < activeWord.c + activeWord.word.length;
                  } else {
                    isInActiveWord =
                      c === activeWord.c && r >= activeWord.r && r < activeWord.r + activeWord.word.length;
                  }
                }

                if (!isActiveCell) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-slate-900/60 rounded"
                    />
                  );
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    className={`relative w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 font-bold rounded flex items-center justify-center text-sm sm:text-base md:text-lg transition-all select-none ${
                      isSelected
                        ? "bg-blue-500 text-white ring-2 ring-white z-10 scale-105"
                        : isInActiveWord
                        ? "bg-blue-950 text-blue-200 border border-blue-500/50"
                        : isCorrect
                        ? "bg-emerald-900/80 text-emerald-200 border border-emerald-500"
                        : isWrong
                        ? "bg-red-950/80 text-red-200 border border-red-500"
                        : "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    {/* Clue Number Badge */}
                    {cellNumberMap.current[`${r},${c}`] && (
                      <span className="absolute top-0.5 left-0.5 text-[8px] sm:text-[9px] font-medium leading-none text-slate-400">
                        {cellNumberMap.current[`${r},${c}`]}
                      </span>
                    )}
                    {cellLetter}
                  </button>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 w-full justify-center">
            <button
              onClick={checkPuzzle}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              Check Answers
            </button>
            <button
              onClick={revealLetter}
              disabled={!selectedCell || isCompleted}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 text-xs sm:text-sm font-semibold rounded-lg border border-amber-500/30 transition-all active:scale-95"
            >
              Reveal Letter
            </button>
            <button
              onClick={() => {
                setUserGrid(Array.from({ length: 10 }, () => Array(10).fill("")));
                setChecked(false);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs sm:text-sm font-medium rounded-lg transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Clue Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 max-h-[460px] overflow-y-auto">
          {/* Active Clue Highlight */}
          {activeWord && (
            <div className="p-3 bg-blue-900/40 border border-blue-500/40 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wide block">
                Selected Clue ({activeWord.num} {activeWord.dir.toUpperCase()})
              </span>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                {activeWord.clue}
              </p>
            </div>
          )}

          {/* Across Clues */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">
              Across
            </h3>
            <div className="flex flex-col gap-1.5">
              {numberedWords
                .filter((w) => w.dir === "across")
                .map((w) => {
                  const isCur = activeWord?.num === w.num && activeWord?.dir === "across";
                  return (
                    <button
                      key={`across-${w.num}`}
                      onClick={() => selectWord(w)}
                      className={`text-left text-xs p-2 rounded-lg transition-all flex items-start gap-2 ${
                        isCur
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <span className="font-bold text-blue-400 shrink-0">{w.num}.</span>
                      <span>{w.clue}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Down Clues */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">
              Down
            </h3>
            <div className="flex flex-col gap-1.5">
              {numberedWords
                .filter((w) => w.dir === "down")
                .map((w) => {
                  const isCur = activeWord?.num === w.num && activeWord?.dir === "down";
                  return (
                    <button
                      key={`down-${w.num}`}
                      onClick={() => selectWord(w)}
                      className={`text-left text-xs p-2 rounded-lg transition-all flex items-start gap-2 ${
                        isCur
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <span className="font-bold text-blue-400 shrink-0">{w.num}.</span>
                      <span>{w.clue}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Virtual On-Screen Keyboard for Mobile / Touch Devices */}
      <div className="w-full max-w-xl flex flex-col gap-1.5 mt-2">
        {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, idx) => (
          <div key={idx} className="flex justify-center gap-1">
            {row.split("").map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => handleInputLetter(ch)}
                className="w-8 sm:w-10 h-10 sm:h-11 bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold rounded text-xs sm:text-sm border border-slate-700 shadow transition-all active:scale-95"
              >
                {ch}
              </button>
            ))}
            {idx === 2 && (
              <button
                type="button"
                onClick={handleBackspace}
                className="px-2.5 sm:px-4 h-10 sm:h-11 bg-red-900/60 hover:bg-red-800 text-red-200 font-bold rounded text-xs sm:text-sm border border-red-700/50 shadow transition-all active:scale-95"
              >
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Completion Modal / Celebration Overlay */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <span className="text-5xl animate-bounce">🏆</span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Puzzle Completed!
            </h2>
            <p className="text-sm text-slate-300">
              Fantastic work! You solved all intersecting words in{" "}
              <span className="text-blue-400 font-semibold">{formatTime(timerSeconds)}</span> with{" "}
              <span className="text-amber-400 font-semibold">{hintsUsed} hints</span>.
            </p>
            <div className="bg-slate-800/80 rounded-xl p-3 w-full border border-slate-700">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Calculated Score</span>
              <span className="text-3xl font-mono font-black text-emerald-400">
                {Math.max(100, 1500 - timerSeconds * 3 - hintsUsed * 100)}
              </span>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  const nextIdx = (selectedPuzzleIdx + 1) % PUZZLES.length;
                  setSelectedPuzzleIdx(nextIdx);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Next Puzzle
              </button>
              <button
                onClick={() => setIsCompleted(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all"
              >
                View Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
