"use client";

import {
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Timer,
  Maximize2,
  Trash2,
} from "lucide-react";
import type { Task } from "./types";

export interface TaskItemProps {
  task: Task;
  isDarkMode: boolean;
  formatSeconds: (seconds: number) => string;
  onToggleComplete: (task: Task) => void;
  onToggleTimer: (task: Task) => void;
  onPomodoro: (taskId: number) => void;
  onFocus: (taskId: number) => void;
  onRequestDelete: (taskId: number) => void;
}

export function TaskItem({
  task,
  isDarkMode,
  formatSeconds,
  onToggleComplete,
  onToggleTimer,
  onPomodoro,
  onFocus,
  onRequestDelete,
}: TaskItemProps) {
  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center gap-3 p-4 md:p-5 rounded-3xl border transition-all ${
        isDarkMode
          ? "bg-slate-900/30 border-slate-800"
          : "bg-white shadow-sm border-slate-100 hover:border-blue-100"
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 flex-1">
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          className="mt-0.5 sm:mt-0 flex-shrink-0"
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed ? (
            <CheckCircle2 className="text-green-500" size={20} />
          ) : (
            <Circle className="text-slate-300" size={20} />
          )}
        </button>
        <span
          className={`text-sm md:text-base font-medium leading-tight ${
            task.completed ? "text-slate-400 line-through" : ""
          }`}
        >
          {task.text}
        </span>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0 border-slate-100 dark:border-slate-800">
        <div
          className={`font-mono text-[10px] md:text-xs px-2 py-1 rounded-lg ${
            task.isCountdown
              ? "bg-orange-50 text-orange-600"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {formatSeconds(task.seconds)}
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {!task.completed && (
            <>
              <button
                type="button"
                onClick={() => onToggleTimer(task)}
                className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                aria-label={task.isActive ? "Pause timer" : "Start timer"}
              >
                {task.isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                type="button"
                onClick={() => onPomodoro(task.id)}
                className="p-1.5 md:p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100"
                aria-label="Start Pomodoro"
              >
                <Timer size={16} />
              </button>
              <button
                type="button"
                onClick={() => onFocus(task.id)}
                className="p-1.5 md:p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-500"
                aria-label="Focus mode"
              >
                <Maximize2 size={16} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onRequestDelete(task.id)}
            className="p-1.5 md:p-2 text-slate-300 hover:text-red-400 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
