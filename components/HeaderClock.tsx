"use client";

import { Headphones } from "lucide-react";

export interface HeaderClockProps {
  isDarkMode: boolean;
  userEmailPrefix?: string;
  time: Date;
  viewDate: string;
}

export function HeaderClock({
  isDarkMode,
  userEmailPrefix,
  time,
  viewDate,
}: HeaderClockProps) {
  const cardClass = isDarkMode
    ? "bg-slate-800/50 border-slate-700"
    : "bg-white/80 border-white shadow-xl";

  return (
    <section
      className={`backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border text-center ${cardClass}`}
    >
      <div className="flex justify-center items-center gap-2 md:gap-3 mb-3 md:mb-4">
        <Headphones size={18} className="text-blue-500 md:w-5 md:h-5" />
        <h2 className="text-lg md:text-xl font-extrabold tracking-[0.25em] uppercase">
          Lofi Note
        </h2>
      </div>
      <p className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1 md:mb-2">
        {userEmailPrefix}
      </p>
      <h1 className="text-5xl md:text-6xl font-extralight tracking-tighter mb-1 md:mb-2">
        {time.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })}
      </h1>
      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
        {new Date(viewDate).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </section>
  );
}
