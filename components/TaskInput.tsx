"use client";

import { Plus } from "lucide-react";

export interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDarkMode: boolean;
}

export function TaskInput({
  value,
  onChange,
  onSubmit,
  isDarkMode,
}: TaskInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 mb-6 md:mb-8">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="จดงานหรือเป้าหมาย..."
        className={`flex-1 border-none rounded-2xl px-5 py-4 outline-none text-sm md:text-base placeholder:opacity-100 ${
          isDarkMode
            ? "bg-slate-900/50 text-slate-100 placeholder:text-slate-400"
            : "bg-slate-50 shadow-inner text-slate-800 placeholder:text-slate-500"
        }`}
      />
      <button
        type="submit"
        className="p-3 md:p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 shadow-lg transition-all"
        aria-label="Add task"
      >
        <Plus size={20} />
      </button>
    </form>
  );
}
