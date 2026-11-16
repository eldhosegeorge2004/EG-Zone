/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from "react";
import "./SimonSays.css";

export type SimonColor = "green" | "red" | "yellow" | "blue";

const COLORS: SimonColor[] = ["green", "red", "yellow", "blue"];

const SOUNDS: Record<SimonColor, number> = {
  green: 329.63,
  red: 261.63,
  yellow: 392.00,
  blue: 523.25,
};

export default function SimonSays() {
  const [sequence, setSequence] = useState<SimonColor[]>([]);
  const [playerSequence, setPlayerSequence] = useState<SimonColor[]>([]);
  const [activeColor, setActiveColor] = useState<SimonColor | null>(null);
  const [level, setLevel] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [status, setStatus] = useState<"ready" | "showing" | "playing" | "over">("ready");
  const [message, setMessage] = useState<string>("Press Start to Play");

  const sequenceRef = useRef<SimonColor[]>([]);
  const lockedRef = useRef<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("simonHighScore");
    if (saved) {
      setHighScore(Number(saved) || 0);
    }
    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  function playSound(color: SimonColor) {
    try {
      const audio = getAudioContext();
      if (!audio) return;

      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.frequency.value = SOUNDS[color];
      oscillator.type = "sine";
      gain.gain.value = 0.15;

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + 0.28
      );
      oscillator.stop(audio.currentTime + 0.28);
    } catch {
      // Audio fallback
    }
  }

  function flash(color: SimonColor, duration = 400) {
    setActiveColor(color);
    playSound(color);

    const timer = setTimeout(() => {
      setActiveColor(null);
    }, duration);

    timerRef.current.push(timer);
  }

  function showSequence(seq: SimonColor[]) {
    lockedRef.current = true;
    setStatus("showing");
    setMessage("Watch the sequence!");

    seq.forEach((color, index) => {
      const timer = setTimeout(() => {
        flash(color);
      }, 700 + index * 750);

      timerRef.current.push(timer);
    });

    const timer = setTimeout(() => {
      lockedRef.current = false;
      setStatus("playing");
      setMessage("Your turn!");
    }, 700 + seq.length * 750);

    timerRef.current.push(timer);
  }

  function nextLevel(previous: SimonColor[]) {
    const next: SimonColor[] = [
      ...previous,
      COLORS[Math.floor(Math.random() * COLORS.length)],
    ];

    sequenceRef.current = next;
    setSequence(next);
    setPlayerSequence([]);
    setLevel(next.length);

    showSequence(next);
  }

  function startGame() {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    sequenceRef.current = [];
    setSequence([]);
    setPlayerSequence([]);
    setLevel(0);
    setActiveColor(null);
    setStatus("playing");
    nextLevel([]);
  }

  function gameOver() {
    lockedRef.current = true;
    setStatus("over");
    setMessage("Game Over!");

    // Play fail sound buzz
    try {
      const audio = getAudioContext();
      if (audio) {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, audio.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, audio.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start();
        osc.stop(audio.currentTime + 0.4);
      }
    } catch {}

    if (level > highScore) {
      setHighScore(level);
      localStorage.setItem("simonHighScore", level.toString());
    }
  }

  function handleClick(color: SimonColor) {
    if (lockedRef.current || status !== "playing") return;

    flash(color);

    const nextPlayer = [...playerSequence, color];
    setPlayerSequence(nextPlayer);

    const index = nextPlayer.length - 1;

    if (sequenceRef.current[index] !== color) {
      gameOver();
      return;
    }

    if (nextPlayer.length === sequenceRef.current.length) {
      lockedRef.current = true;
      setMessage("Correct! Get ready...");

      const timer = setTimeout(() => {
        nextLevel(sequenceRef.current);
      }, 900);

      timerRef.current.push(timer);
    }
  }

  return (
    <div className="simon-wrapper">
      <header className="simon-header">
        <h1>SIMON SAYS</h1>
        <p>Remember the pattern. Repeat the sequence!</p>
      </header>

      <div className="simon-stats">
        <div>
          <span>LEVEL</span>
          <strong>{level}</strong>
        </div>
        <div>
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>
      </div>

      <div className="simon-board">
        {COLORS.map((color) => (
          <button
            key={color}
            aria-label={`${color} button`}
            onClick={() => handleClick(color)}
            disabled={status !== "playing" || lockedRef.current}
            className={`simon-button ${color} ${
              activeColor === color ? "active" : ""
            }`}
          />
        ))}
        <div className="simon-center">
          <span>EGZONE</span>
          <strong>{level || "PLAY"}</strong>
        </div>
      </div>

      <p className="simon-message" aria-live="polite">
        {message}
      </p>

      {status === "ready" && (
        <button className="simon-start" onClick={startGame}>
          START GAME
        </button>
      )}

      {status === "over" && (
        <div className="simon-gameover">
          <h2>Game Over!</h2>
          <p>You reached level {level}</p>
          <button className="simon-start" onClick={startGame}>
            PLAY AGAIN
          </button>
        </div>
      )}

      <p className="simon-tip">
        Watch carefully and repeat the colours in the correct order.
      </p>
    </div>
  );
}