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
  
  // Auth States
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const [viewDate, setViewDate] = useState(getTodayString());

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Ticker Logic (ตัวนับเวลา)
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

  // 2. Auth Guard & Initial Load
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
    
    // ชั่วคราว: ดึงข้อมูลจาก LocalStorage ไปก่อน (เดี๋ยวเฟสหน้าเราจะย้ายไป Supabase DB)
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

  // ฟังก์ชันแก้ Volume หน่วง
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-slate-400 font-medium animate-pulse uppercase tracking-widest text-xs">Authenticating...</p>
        </div>
      </div>
    );
  }

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTask: Task = { 
      id: Date.now(), text: inputValue, completed: false, seconds: 0, isActive: false, isCountdown: false, date: getTodayString() 
    };
    setTasks([newTask, ...tasks]);
    setInputValue("");
    setViewDate(getTodayString());
  };

  // ฟังก์ชัน Pomodoro ที่หายไป
  const setPomodoro = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, seconds: 1500, isCountdown: true, isActive: false } : t));
  };

  const themeClass = isDarkMode ? "bg-[#0f172a] text-slate-100" : "bg-[#f1f5f9] text-[#1e293b]";
  const cardClass = isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white/70 border-white shadow-2xl shadow-slate-200/50";
  const tasksToDisplay = tasks.filter(t => t.date === viewDate);
  const isViewingToday = viewDate === getTodayString();
  const focusedTask = focusedTaskId ? tasks.find(t => t.id === focusedTaskId) : null;

  return (
    <div className={`min-h-screen flex flex-col items-center py-12 px-6 transition-colors duration-500 pb-24 ${themeClass} ${promptFont.className}`}>
      
      <audio ref={audioRef} src="https://stream.zeno.fm/f3wvbbqmdg8uv" preload="none" />
      <div className={`fixed top-0 left-0 w-full h-1 bg-gradient-to-r ${isDarkMode ? 'from-indigo-600 to-purple-600' : 'from-blue-400 to-indigo-400'}`} />
      
      {/* Logout Button */}
      <button onClick={async () => await supabase.auth.signOut()} className="fixed top-6 left-6 p-4 text-slate-400 hover:text-red-500 transition-all z-50 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
        <LogOut size={20} /> <span className="hidden md:inline">Sign Out</span>
      </button>

      {/* Dark Mode */}
      <button onClick={() => setIsDarkMode(!isDarkMode)} className={`fixed top-6 right-6 p-4 rounded-full border-2 z-50 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-yellow-400' : 'bg-white border-blue-100 text-indigo-500'}`}>
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <main className="w-full max-w-2xl space-y-6 mt-10">
        <section className={`backdrop-blur-xl rounded-[2.5rem] p-10 border text-center ${cardClass}`}>
          <div className="flex justify-center items-center gap-3 mb-4">
            <Headphones size={20} className="text-blue-500" />
            <h2 className="text-xl font-extrabold tracking-[0.25em] uppercase">Lofi Note</h2>
          </div>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">Welcome, {user?.email?.split('@')[0]}</p>
          <h1 className="text-6xl font-extralight tracking-tighter mb-2">{time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(viewDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </section>

        {/* Task List Section */}
        <section className={`backdrop-blur-xl rounded-[2.5rem] p-8 border ${cardClass}`}>
          <div className="flex items-center justify-between mb-8 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl">
            <button onClick={() => {
               const current = new Date(viewDate);
               current.setDate(current.getDate() - 1);
               setViewDate(current.toISOString().split('T')[0]);
            }} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Calendar size={16} className="text-blue-500" />
              <span>{isViewingToday ? "วันนี้" : viewDate}</span>
            </div>
            <button onClick={() => {
               const current = new Date(viewDate);
               current.setDate(current.getDate() + 1);
               setViewDate(current.toISOString().split('T')[0]);
            }} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500"><ChevronRight size={20} /></button>
          </div>

          {isViewingToday && (
            <form onSubmit={addTask} className="flex gap-2 mb-8">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="จดงานหรือตั้งเป้าหมาย..." className={`flex-1 border-none rounded-2xl px-5 py-4 outline-none ${isDarkMode ? 'bg-slate-900/50' : 'bg-white shadow-inner'}`} />
              <button type="submit" className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 shadow-lg transition-all"><Plus size={24} /></button>
            </form>
          )}

          <div className="space-y-4">
            {tasksToDisplay.length === 0 ? (
              <div className="text-center py-12 text-slate-400"><Layout size={40} className="mx-auto mb-4 opacity-20" /><p className="text-sm italic">ไม่มีรายการงาน</p></div>
            ) : (
              tasksToDisplay.map((task) => (
                <div key={task.id} className={`group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white shadow-sm border-slate-50'}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => isViewingToday && setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed, isActive: false} : t))}>
                      {task.completed ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-slate-300" size={24} />}
                    </button>
                    <span className={`text-base font-medium ${task.completed ? 'text-slate-400 line-through' : ''}`}>{task.text}</span>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className={`font-mono text-xs px-2 py-1 rounded-lg ${task.isCountdown ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {formatSeconds(task.seconds)}
                    </div>
                    {isViewingToday && !task.completed && (
                      <>
                        <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, isActive: !t.isActive} : t))} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100">{task.isActive ? <Pause size={18} /> : <Play size={18} />}</button>
                        {/* ปุ่ม Pomodoro */}
                        <button onClick={() => setPomodoro(task.id)} title="Set 25 min" className="p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100"><Timer size={18} /></button>
                        {/* ปุ่ม Focus Mode */}
                        <button onClick={() => setFocusedTaskId(task.id)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-500"><Maximize2 size={18} /></button>
                      </>
                    )}
                    <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="p-2 text-slate-300 hover:text-red-400"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Music Player */}
      <div className={`fixed bottom-6 right-6 flex items-center gap-2 p-3 rounded-full transition-all border-2 z-[100] group ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-blue-100'}`}>
        <button onClick={() => { if (audioRef.current) isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); }}>
          {isPlaying ? <Volume2 size={24} className="animate-pulse text-blue-500" /> : <Headphones size={24} className={isDarkMode ? 'text-indigo-400' : 'text-blue-500'} />}
        </button>
        <div className="w-0 group-hover:w-24 transition-all duration-500 overflow-hidden flex items-center">
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={volume} 
            onChange={handleVolumeChange} 
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none transition-all ${isDarkMode ? 'bg-slate-600 accent-indigo-400' : 'bg-slate-200 accent-blue-500'}`} 
          />
        </div>
      </div>

      {/* Focus Mode Overlay ที่กู้คืนมาแล้ว */}
      {focusedTask && (
        <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 transition-all duration-500 backdrop-blur-3xl ${isDarkMode ? 'bg-slate-950/90' : 'bg-white/90'}`}>
          <button onClick={() => setFocusedTaskId(null)} className="absolute top-8 right-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-full hover:scale-110 transition-transform text-slate-500 dark:text-slate-400">
            <X size={32} />
          </button>

          <div className="text-center max-w-4xl w-full flex flex-col items-center">
            <span className="flex items-center gap-2 text-indigo-500 font-bold tracking-[0.3em] uppercase text-sm mb-8">
              <span className="relative flex h-3 w-3">
                {focusedTask.isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>}
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              Deep Focus Mode
            </span>
            
            <h2 className={`text-4xl md:text-6xl font-medium mb-16 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {focusedTask.text}
            </h2>

            <div className={`font-mono text-8xl md:text-[10rem] font-light tracking-tighter mb-16 tabular-nums ${(focusedTask.isCountdown && focusedTask.seconds === 0) ? 'text-red-500' : 'text-blue-500'}`}>
              {formatSeconds(focusedTask.seconds)}
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setTasks(tasks.map(t => t.id === focusedTask.id ? {...t, isActive: !t.isActive} : t))} 
                className={`flex items-center gap-3 px-8 py-5 rounded-3xl text-xl font-medium transition-all hover:scale-105 shadow-2xl ${focusedTask.isActive ? 'bg-orange-100 text-orange-600 shadow-orange-500/20' : 'bg-blue-500 text-white shadow-blue-500/30'}`}
              >
                {focusedTask.isActive ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
                {focusedTask.isActive ? "Pause Focus" : "Resume Focus"}
              </button>
              
              <button 
                onClick={() => { 
                  setTasks(tasks.map(t => t.id === focusedTask.id ? {...t, completed: true, isActive: false} : t)); 
                  setFocusedTaskId(null); 
                }} 
                className={`flex items-center gap-3 px-8 py-5 rounded-3xl text-xl font-medium transition-all hover:scale-105 border-2 ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <CheckCircle2 size={28} />
                เสร็จสิ้นภารกิจ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}