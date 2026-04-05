"use client";

import { LogOut, Sun, Moon } from "lucide-react";

export interface TopNavigationProps {
  onSignOut: () => void | Promise<void>;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function TopNavigation({
  onSignOut,
  isDarkMode,
  onToggleDarkMode,
}: TopNavigationProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => void onSignOut()}
        className="fixed top-4 left-4 md:top-6 md:left-6 p-3 text-slate-400 z-50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full border border-slate-100 dark:border-slate-700 hover:text-red-500 transition-all shadow-sm"
        aria-label="Sign out"
      >
        <LogOut size={18} />
      </button>
      <button
        type="button"
        onClick={onToggleDarkMode}
        className={`fixed top-4 right-4 md:top-6 md:right-6 p-3 rounded-full border z-50 backdrop-blur-md ${
          isDarkMode
            ? "bg-slate-800/80 border-slate-600 text-yellow-400"
            : "bg-white/80 border-slate-100 text-indigo-500 shadow-sm"
        }`}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </>
  );
}
