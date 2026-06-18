"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { site } from "../lib/config";
import type { Episode } from "../lib/rss";

type PlayerContextValue = {
  current: Episode | null;
  isPlaying: boolean;
  /** Start (or toggle) playback of an episode. */
  play: (ep: Episode) => void;
  isCurrent: (ep: Episode) => boolean;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within <PlayerProvider>");
  return ctx;
}

const RATES = [1, 1.25, 1.5, 2];

function fmt(t: number): string {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Restore the listener's preferred volume on first mount.
  useEffect(() => {
    const stored = window.localStorage.getItem("player-volume");
    if (stored !== null) {
      const v = Number(stored);
      if (Number.isFinite(v)) {
        setVolume(v);
        setMuted(v === 0);
      }
    }
  }, []);

  // Keep the audio element + storage in sync with volume/mute state.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }
    window.localStorage.setItem("player-volume", String(volume));
  }, [volume, muted, current]);

  const play = useCallback(
    (ep: Episode) => {
      const audio = audioRef.current;
      if (!audio) return;

      // Episode without a direct audio file: open its page instead.
      if (!ep.audioUrl) {
        if (ep.link) window.open(ep.link, "_blank", "noreferrer");
        return;
      }

      // Same episode → toggle play/pause.
      if (current?.id === ep.id) {
        if (audio.paused) void audio.play();
        else audio.pause();
        return;
      }

      setCurrent(ep);
      setCurrentTime(0);
      setDuration(0);
      audio.src = ep.audioUrl;
      audio.playbackRate = rate;
      audio.volume = volume;
      audio.muted = muted;
      void audio.play().catch(() => {});
    },
    [current, rate, volume, muted],
  );

  const isCurrent = useCallback(
    (ep: Episode) => current?.id === ep.id,
    [current],
  );

  // Keep <body> padded so the fixed bar never hides the footer.
  useEffect(() => {
    document.body.classList.toggle("has-player", current !== null);
    return () => document.body.classList.remove("has-player");
  }, [current]);

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = value;
    setCurrentTime(value);
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(
      Math.max(0, audio.currentTime + delta),
      duration || audio.duration || 0,
    );
  };

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (muted || volume === 0) {
      setMuted(false);
      if (volume === 0) setVolume(0.6);
    } else {
      setMuted(true);
    }
  };

  const toggleCurrent = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const close = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setCurrent(null);
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider value={{ current, isPlaying, play, isCurrent }}>
      {children}

      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {current ? (
        <div className="player-bar" role="region" aria-label="נגן הפודקאסט">
          <div
            className="player-progress-line"
            aria-hidden="true"
            style={{
              transform: `scaleX(${duration ? currentTime / duration : 0})`,
            }}
          />
          <div className="player-inner container">
            <div className="player-meta">
              <Image
                src={current.image || site.cover}
                alt=""
                width={48}
                height={48}
                className="player-thumb"
              />
              <div className="player-text">
                {current.episodeNumber ? (
                  <span className="player-ep">פרק {current.episodeNumber}</span>
                ) : null}
                <span className="player-title" title={current.title}>
                  {current.title}
                </span>
              </div>
            </div>

            <div className="player-controls">
              <button
                type="button"
                className="player-skip"
                onClick={() => skip(-15)}
                aria-label="אחורה 15 שניות"
              >
                <SkipIcon dir="back" />
                <span>15</span>
              </button>
              <button
                type="button"
                className="player-toggle"
                onClick={toggleCurrent}
                aria-label={isPlaying ? "השהיה" : "נגן"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                className="player-skip"
                onClick={() => skip(30)}
                aria-label="קדימה 30 שניות"
              >
                <span>30</span>
                <SkipIcon dir="fwd" />
              </button>
            </div>

            <div className="player-seek">
              <span className="player-time">{fmt(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="מיקום בפרק"
                style={
                  {
                    "--played": `${duration ? (currentTime / duration) * 100 : 0}%`,
                  } as React.CSSProperties
                }
              />
              <span className="player-time">{fmt(duration)}</span>
            </div>

            <div className="player-extra">
              <div className="player-volume">
                <button
                  type="button"
                  className="player-volbtn"
                  onClick={toggleMute}
                  aria-label={
                    muted || volume === 0 ? "ביטול השתקה" : "השתקה"
                  }
                >
                  <VolumeIcon level={muted ? 0 : volume} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="player-volrange"
                  aria-label="עוצמת שמע"
                  style={
                    {
                      "--played": `${(muted ? 0 : volume) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
              <button
                type="button"
                className="player-rate"
                onClick={cycleRate}
                aria-label="מהירות נגינה"
              >
                {rate}×
              </button>
              <button
                type="button"
                className="player-close"
                onClick={close}
                aria-label="סגירת הנגן"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PlayerContext.Provider>
  );
}

/* ---------- local icons ---------- */

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function SkipIcon({ dir }: { dir: "back" | "fwd" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={dir === "fwd" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M9 4 4 9l5 5" />
      <path d="M4 9h9a7 7 0 1 1-7 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function VolumeIcon({ level }: { level: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4z" />
      {level <= 0 ? (
        <path d="M22 9l-5 6M17 9l5 6" />
      ) : level < 0.55 ? (
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 6a9 9 0 0 1 0 12" />
        </>
      )}
    </svg>
  );
}
