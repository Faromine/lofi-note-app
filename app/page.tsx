"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from 'next/font/google';
import { 
  Clock, ExternalLink, Layout, MessageCircle, 
  User, Settings, Sun, Moon, Plus, Trash2, CheckCircle2, Circle, RefreshCw,
  Headphones, Volume2, Play, Pause, RotateCcw, Maximize2, X, Timer, 
  ChevronLeft, ChevronRight, Calendar, LogOut, Loader2
} from 'lucide-react';
import { supabase } from './lib/supabase';

const promptFont = Prompt({ 
  weight: ['200', '300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  display: 'swap',
});

interface Task {
  id: number;
  text: string;
  completed: boolean;
  seconds: number;
  isActive: boolean;
  isCountdown: boolean;
  date: string;
}

export default function LofiNoteApp() {
  const router = useRouter();
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const [viewDate, setViewDate] = useState(getTodayString());

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const ticker = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.isActive && !task.completed) {
            const nextSeconds = task.isCountdown ? Math.max(0, task.seconds - 1) : task.seconds + 1;
            const reachedEnd = task.isCountdown && nextSeconds === 0;
            return { ...task, seconds: nextSeconds, isActive: reachedEnd ? false : task.isActive };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setIsAuthLoading(false);
        setMounted(true);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });

    document.title = "Lofi Note | Protected Space";
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const savedTasks = localStorage.getItem("lofinote-v4-tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    const savedTheme = localStorage.getItem("lofinote-theme");
    if (savedTheme === "dark") setIsDarkMode(true);
    
    return () => {
      clearInterval(timer);
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("lofinote-v4-tasks", JSON.stringify(tasks));
      localStorage.setItem("lofinote-theme", isDarkMode ? "dark" : "light");
    }
  }, [tasks, isDarkMode, mounted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const formatSeconds = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isAuthLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#f1f5f9] ${promptFont.className}`}>
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTask: Task = { id: Date.now(), text: inputValue, completed: false, seconds: 0, isActive: false, isCountdown: false, date: getTodayString() };
    setTasks([newTask, ...tasks]);
    setInputValue("");
    setViewDate(getTodayString());
  };

  const setPomodoro = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, seconds: 1500, isCountdown: true, isActive: false } : t));

  const themeClass = isDarkMode ? "bg-[#0f172a] text-slate-100" : "bg-[#f1f5f9] text-[#1e293b]";
  const cardClass = isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white/80 border-white shadow-xl shadow-slate-200/50";
  const tasksToDisplay = tasks.filter(t => t.date === viewDate);
  const isViewingToday = viewDate === getTodayString();
  const focusedTask = focusedTaskId ? tasks.find(t => t.id === focusedTaskId) : null;

  return (
    <div className={`min-h-screen flex flex-col items-center py-8 md:py-12 px-4 md:px-6 transition-colors duration-500 pb-28 md:pb-24 ${themeClass} ${promptFont.className}`}>
      
      <audio ref={audioRef} src="https://stream.zeno.fm/f3wvbbqmdg8uv" preload="none" />
      <div className={`fixed top-0 left-0 w-full h-1 bg-gradient-to-r ${isDarkMode ? 'from-indigo-600 to-purple-600' : 'from-blue-400 to-indigo-400'}`} />
      
      {/* Top Bar Buttons (Mobile Optimized) */}
      <button onClick={async () => await supabase.auth.signOut()} className="fixed top-4 left-4 md:top-6 md:left-6 p-3 md:p-4 text-slate-400 hover:text-red-500 transition-all z-50 flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full border border-slate-100 dark:border-slate-700">
        <LogOut size={18} /> <span className="hidden md:inline">Sign Out</span>
      </button>

      <button onClick={() => setIsDarkMode(!isDarkMode)} className={`fixed top-4 right-4 md:top-6 md:right-6 p-3 md:p-4 rounded-full border z-50 backdrop-blur-md ${isDarkMode ? 'bg-slate-800/80 border-slate-600 text-yellow-400' : 'bg-white/80 border-slate-100 text-indigo-500 shadow-sm'}`}>
        {isDarkMode ? <Sun size={20} className="md:w-6 md:h-6" /> : <Moon size={20} className="md:w-6 md:h-6" />}
      </button>

      <main className="w-full max-w-2xl space-y-4 md:space-y-6 mt-14 md:mt-10">
        <section className={`backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border text-center ${cardClass}`}>
          <div className="flex justify-center items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Headphones size={18} className="text-blue-500 md:w-5 md:h-5" />
            <h2 className="text-lg md:text-xl font-extrabold tracking-[0.25em] uppercase">Lofi Note</h2>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1 md:mb-2">Welcome, {user?.email?.split('@')[0]}</p>
          <h1 className="text-5xl md:text-6xl font-extralight tracking-tighter mb-1 md:mb-2">{time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</h1>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(viewDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </section>

        <section className={`backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border ${cardClass}`}>
          <div className="flex items-center justify-between mb-6 md:mb-8 bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 p-2 rounded-2xl">
            <button onClick={() => {
               const current = new Date(viewDate);
               current.setDate(current.getDate() - 1);
               setViewDate(current.toISOString().split('T')[0]);
            }} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Calendar size={16} className="text-blue-500" />
              <span>{isViewingToday ? "วันนี้" : viewDate}</span>
            </div>
            <button onClick={() => {
               const current = new Date(viewDate);
               current.setDate(current.getDate() + 1);
               setViewDate(current.toISOString().split('T')[0]);
            }} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"><ChevronRight size={18} /></button>
          </div>

          {isViewingToday && (
            <form onSubmit={addTask} className="flex gap-2 mb-6 md:mb-8">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="จดงานหรือตั้งเป้าหมาย..."
                className={`flex-1 border-none rounded-2xl px-5 py-4 outline-none placeholder:opacity-100 ${
                  isDarkMode
                    ? 'bg-slate-900/50 text-slate-100 placeholder:text-slate-400'
                    : 'bg-white shadow-inner text-slate-800 placeholder:text-slate-500'
                }`}
              />
              <button type="submit" className="p-3 md:p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 shadow-lg transition-all"><Plus size={20} className="md:w-6 md:h-6" /></button>
            </form>
          )}

          <div className="space-y-3 md:space-y-4">
            {tasksToDisplay.length === 0 ? (
              <div className="text-center py-10 text-slate-400"><Layout size={32} className="mx-auto mb-3 opacity-20" /><p className="text-xs md:text-sm italic">ไม่มีรายการงาน</p></div>
            ) : (
              tasksToDisplay.map((task) => (
                <div key={task.id} className={`group flex flex-col sm:flex-row sm:items-center gap-3 p-4 md:p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white shadow-sm border-slate-100'}`}>
                  <div className="flex items-start sm:items-center gap-3 flex-1">
                    {/* ตรงนี้ปลดล็อกให้กด Done ได้ทุกวัน */}
                    <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed, isActive: false} : t))} className="mt-0.5 sm:mt-0 flex-shrink-0">
                      {task.completed ? <CheckCircle2 className="text-green-500" size={20} /> : <Circle className="text-slate-300" size={20} />}
                    </button>
                    <span className={`text-sm md:text-base font-medium leading-tight ${task.completed ? 'text-slate-400 line-through' : ''}`}>{task.text}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0 border-slate-100 dark:border-slate-800">
                    <div className={`font-mono text-[10px] md:text-xs px-2 py-1 rounded-lg ${task.isCountdown ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {formatSeconds(task.seconds)}
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      {/* ตรงนี้ปลดล็อกให้เล่น/หยุดเวลาได้ทุกวัน */}
                      {!task.completed && (
                        <>
                          <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, isActive: !t.isActive} : t))} className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100">{task.isActive ? <Pause size={16} /> : <Play size={16} />}</button>
                          <button onClick={() => setPomodoro(task.id)} className="p-1.5 md:p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100"><Timer size={16} /></button>
                          <button onClick={() => setFocusedTaskId(task.id)} className="p-1.5 md:p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-500"><Maximize2 size={16} /></button>
                        </>
                      )}
                      <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="p-1.5 md:p-2 text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Music Player (Mobile Optimized) */}
      <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 p-3 md:p-3.5 rounded-full transition-all border z-[100] group ${isDarkMode ? 'bg-slate-800/90 border-slate-600 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md shadow-lg'}`}>
        <button onClick={() => { if (audioRef.current) isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); }}>
          {isPlaying ? <Volume2 size={20} className="animate-pulse text-blue-500 md:w-6 md:h-6" /> : <Headphones size={20} className={`md:w-6 md:h-6 ${isDarkMode ? 'text-indigo-400' : 'text-blue-500'}`} />}
        </button>
        <div className="w-0 group-hover:w-20 md:group-hover:w-24 transition-all duration-500 overflow-hidden flex items-center">
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className={`w-full h-1 md:h-1.5 rounded-lg appearance-none outline-none transition-all ${isDarkMode ? 'bg-slate-600 accent-indigo-400' : 'bg-slate-200 accent-blue-500'}`} />
        </div>
      </div>

      {/* Focus Mode Overlay (Mobile Optimized) */}
      {focusedTask && (
        <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 transition-all duration-500 backdrop-blur-3xl ${isDarkMode ? 'bg-slate-950/95' : 'bg-white/95'}`}>
          <button onClick={() => setFocusedTaskId(null)} className="absolute top-6 right-6 md:top-8 md:right-8 p-3 md:p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><X size={24} className="md:w-8 md:h-8" /></button>
          <div className="text-center max-w-4xl w-full flex flex-col items-center">
            <h2 className={`text-3xl md:text-6xl font-medium mb-8 md:mb-16 leading-tight px-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{focusedTask.text}</h2>
            <div className={`font-mono text-7xl md:text-[10rem] font-light tracking-tighter mb-12 md:mb-16 tabular-nums ${(focusedTask.isCountdown && focusedTask.seconds === 0) ? 'text-red-500' : 'text-blue-500'}`}>
              {formatSeconds(focusedTask.seconds)}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto px-6">
              <button onClick={() => setTasks(tasks.map(t => t.id === focusedTask.id ? {...t, isActive: !t.isActive} : t))} className={`w-full md:w-auto flex justify-center items-center gap-3 px-8 py-4 md:py-5 rounded-3xl text-lg md:text-xl font-medium transition-all shadow-xl ${focusedTask.isActive ? 'bg-orange-100 text-orange-600' : 'bg-blue-500 text-white'}`}>
                {focusedTask.isActive ? <Pause size={24} /> : <Play size={24} fill="currentColor" />} {focusedTask.isActive ? "Pause" : "Focus"}
              </button>
              <button onClick={() => { setTasks(tasks.map(t => t.id === focusedTask.id ? {...t, completed: true, isActive: false} : t)); setFocusedTaskId(null); }} className={`w-full md:w-auto flex justify-center items-center gap-3 px-8 py-4 md:py-5 rounded-3xl text-lg md:text-xl font-medium transition-all border-2 ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                <CheckCircle2 size={24} /> เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}