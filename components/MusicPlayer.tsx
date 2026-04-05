"use client";

import { forwardRef } from "react";
import { Headphones, Volume2 } from "lucide-react";

export interface MusicPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isDarkMode: boolean;
  streamUrl?: string;
}

export const MusicPlayer = forwardRef<HTMLAudioElement, MusicPlayerProps>(
  function MusicPlayer(
    {
      isPlaying,
      onTogglePlay,
      volume,
      onVolumeChange,
      isDarkMode,
      streamUrl = "https://stream.zeno.fm/f3wvbbqmdg8uv",
    },
    ref
  ) {
    return (
      <>
        <audio ref={ref} src={streamUrl} preload="none" />
        <div
          className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 p-3 md:p-3.5 rounded-full transition-all border z-[100] group ${
            isDarkMode
              ? "bg-slate-800/90 border-slate-600 backdrop-blur-md"
              : "bg-white/90 border-slate-200 shadow-lg backdrop-blur-md"
          }`}
        >
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? (
              <Volume2 size={20} className="animate-pulse text-blue-500" />
            ) : (
              <Headphones
                size={20}
                className={isDarkMode ? "text-indigo-400" : "text-blue-500"}
              />
            )}
          </button>
          <div className="w-0 group-hover:w-20 md:group-hover:w-24 transition-all duration-500 overflow-hidden flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full h-1 md:h-1.5 bg-slate-200 accent-blue-500 rounded-lg appearance-none cursor-pointer dark:bg-slate-600 dark:accent-indigo-400"
            />
          </div>
        </div>
      </>
    );
  }
);
