"use client";

import { CheckCircle2, Pause, Play, X } from "lucide-react";
import type { Task } from "./types";

export interface FocusModalProps {
  task: Task;
  isDarkMode: boolean;
  formatSeconds: (seconds: number) => string;
  onClose: () => void;
  onToggleTimer: (task: Task) => void;
  onCompleteAndClose: (task: Task) => void;
}

export function FocusModal({
  task,
  isDarkMode,
  formatSeconds,
  onClose,
  onToggleTimer,
  onCompleteAndClose,
}: FocusModalProps) {
  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 transition-all duration-500 backdrop-blur-3xl ${
        isDarkMode ? "bg-slate-950/95" : "bg-white/95"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 md:top-8 md:right-8 p-3 md:p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:scale-110 transition-transform"
        aria-label="Close focus mode"
      >
        <X size={24} className="md:w-8 md:h-8" />
      </button>
      <div className="text-center max-w-4xl w-full flex flex-col items-center">
        <h2
          className={`text-3xl md:text-6xl font-medium mb-8 md:mb-16 leading-tight px-4 ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {task.text}
        </h2>
        <div
          className={`font-mono text-7xl md:text-[10rem] font-light tracking-tighter mb-12 md:mb-16 tabular-nums ${
            task.isCountdown && task.seconds === 0
              ? "text-red-500"
              : "text-blue-500"
          }`}
        >
          {formatSeconds(task.seconds)}
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto px-6">
          <button
            type="button"
            onClick={() => onToggleTimer(task)}
            className={`w-full md:w-auto flex justify-center items-center gap-3 px-8 py-4 md:py-5 rounded-3xl text-lg md:text-xl font-medium shadow-xl transition-transform hover:scale-105 ${
              task.isActive
                ? "bg-orange-100 text-orange-600"
                : "bg-blue-500 text-white shadow-blue-500/30"
            }`}
          >
            {task.isActive ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}{" "}
            {task.isActive ? "Pause Focus" : "Start Focus"}
          </button>
          <button
            type="button"
            onClick={() => onCompleteAndClose(task)}
            className={`w-full md:w-auto flex justify-center items-center gap-3 px-8 py-4 md:py-5 rounded-3xl text-lg md:text-xl font-medium transition-all border-2 ${
              isDarkMode
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <CheckCircle2 size={24} /> เสร็จสิ้นภารกิจ
          </button>
        </div>
      </div>
    </div>
  );
}
