"use client";

import type { ReactNode } from "react";
import { Calendar, ChevronLeft, ChevronRight, Layout } from "lucide-react";
import type { Task } from "./types";
import { TaskItem } from "./TaskItem";

export interface TaskListProps {
  isDarkMode: boolean;
  viewDate: string;
  onShiftViewDate: (dayDelta: number) => void;
  isViewingToday: boolean;
  tasks: Task[];
  formatSeconds: (seconds: number) => string;
  onToggleComplete: (task: Task) => void;
  onToggleTimer: (task: Task) => void;
  onPomodoro: (taskId: number) => void;
  onFocus: (taskId: number) => void;
  onRequestDelete: (taskId: number) => void;
  inputSlot?: ReactNode;
}

export function TaskList({
  isDarkMode,
  viewDate,
  onShiftViewDate,
  isViewingToday,
  tasks,
  formatSeconds,
  onToggleComplete,
  onToggleTimer,
  onPomodoro,
  onFocus,
  onRequestDelete,
  inputSlot,
}: TaskListProps) {
  const cardClass = isDarkMode
    ? "bg-slate-800/50 border-slate-700"
    : "bg-white/80 border-white shadow-xl";

  return (
    <section
      className={`backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border ${cardClass}`}
    >
      <div className="flex items-center justify-between mb-6 md:mb-8 bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 p-2 rounded-2xl">
        <button
          type="button"
          onClick={() => onShiftViewDate(-1)}
          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
          aria-label="Previous day"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Calendar size={16} className="text-blue-500" />
          <span>{isViewingToday ? "วันนี้" : viewDate}</span>
        </div>
        <button
          type="button"
          onClick={() => onShiftViewDate(1)}
          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {inputSlot}

      <div className="space-y-3 md:space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Layout size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-xs md:text-sm italic">ไม่มีรายการงาน</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isDarkMode={isDarkMode}
              formatSeconds={formatSeconds}
              onToggleComplete={onToggleComplete}
              onToggleTimer={onToggleTimer}
              onPomodoro={onPomodoro}
              onFocus={onFocus}
              onRequestDelete={onRequestDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
