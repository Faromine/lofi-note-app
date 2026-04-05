"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Prompt } from "next/font/google";
import { Loader2 } from "lucide-react";
import { supabase } from "./lib/supabase";
import type { Task } from "@/components/types";
import { TopNavigation } from "@/components/TopNavigation";
import { HeaderClock } from "@/components/HeaderClock";
import { TaskInput } from "@/components/TaskInput";
import { TaskList } from "@/components/TaskList";
import { MusicPlayer } from "@/components/MusicPlayer";
import { FocusModal } from "@/components/FocusModal";
import { DeleteModal } from "@/components/DeleteModal";

const promptFont = Prompt({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  display: "swap",
});

export default function LofiNoteApp() {
  const router = useRouter();
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(
    null
  );
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const getTodayString = () => new Date().toISOString().split("T")[0];
  const [viewDate, setViewDate] = useState(getTodayString());

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchTasks = async (userId: string) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false });

    if (data) {
      const now = Date.now();
      const syncedTasks = data.map((task: Task) => {
        if (task.isActive && task.last_started_at) {
          const startTime = new Date(task.last_started_at).getTime();
          const diffInSeconds = Math.floor((now - startTime) / 1000);

          const updatedSeconds = task.isCountdown
            ? Math.max(0, task.seconds - diffInSeconds)
            : task.seconds + diffInSeconds;

          const updatedActive =
            task.isCountdown && updatedSeconds === 0 ? false : task.isActive;

          void supabase
            .from("tasks")
            .update({
              seconds: updatedSeconds,
              isActive: updatedActive,
              last_started_at: new Date().toISOString(),
            })
            .eq("id", task.id);

          return {
            ...task,
            seconds: updatedSeconds,
            isActive: updatedActive,
            last_started_at: new Date().toISOString(),
          };
        }
        return task;
      });
      setTasks(syncedTasks);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setIsAuthLoading(false);
        setMounted(true);
        void fetchTasks(session.user.id);
      }
    };
    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login");
      else {
        setUser(session.user);
        void fetchTasks(session.user.id);
      }
    });

    const timer = setInterval(() => setTime(new Date()), 1000);
    const savedTheme = localStorage.getItem("lofinote-theme");
    if (savedTheme === "dark") setIsDarkMode(true);

    return () => {
      clearInterval(timer);
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const ticker = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.isActive && !task.completed) {
            const nextSeconds = task.isCountdown
              ? Math.max(0, task.seconds - 1)
              : task.seconds + 1;
            const reachedEnd = task.isCountdown && nextSeconds === 0;

            if (nextSeconds % 10 === 0) {
              void supabase
                .from("tasks")
                .update({
                  seconds: nextSeconds,
                  isActive: reachedEnd ? false : task.isActive,
                  last_started_at: new Date().toISOString(),
                })
                .eq("id", task.id);
            }

            return {
              ...task,
              seconds: nextSeconds,
              isActive: reachedEnd ? false : task.isActive,
              last_started_at: reachedEnd ? null : new Date().toISOString(),
            };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("lofinote-theme", isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode, mounted]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;
    const newTask = {
      id: Date.now(),
      user_id: user.id,
      text: inputValue,
      completed: false,
      seconds: 0,
      isActive: false,
      isCountdown: false,
      date: getTodayString(),
    };
    const { error } = await supabase.from("tasks").insert([newTask]);
    if (!error) {
      setTasks([newTask as Task, ...tasks]);
      setInputValue("");
      setViewDate(getTodayString());
    }
  };

  const updateTaskStatus = async (task: Task) => {
    const newStatus = !task.completed;
    const { error } = await supabase
      .from("tasks")
      .update({
        completed: newStatus,
        isActive: false,
        last_started_at: null,
      })
      .eq("id", task.id);
    if (!error) {
      setTasks(
        tasks.map((t) =>
          t.id === task.id
            ? { ...t, completed: newStatus, isActive: false, last_started_at: null }
            : t
        )
      );
    }
  };

  const toggleTimer = async (task: Task) => {
    const newActive = !task.isActive;
    const now = newActive ? new Date().toISOString() : null;

    await supabase
      .from("tasks")
      .update({
        isActive: newActive,
        seconds: task.seconds,
        last_started_at: now,
      })
      .eq("id", task.id);
    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, isActive: newActive, last_started_at: now } : t
      )
    );
  };

  const setPomodoro = async (id: number) => {
    await supabase
      .from("tasks")
      .update({
        seconds: 1500,
        isCountdown: true,
        isActive: false,
        last_started_at: null,
      })
      .eq("id", id);
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              seconds: 1500,
              isCountdown: true,
              isActive: false,
              last_started_at: null,
            }
          : t
      )
    );
  };

  const deleteTask = async () => {
    if (taskToDelete === null) return;
    const { error } = await supabase.from("tasks").delete().eq("id", taskToDelete);
    if (!error) {
      setTasks(tasks.filter((t) => t.id !== taskToDelete));
      setTaskToDelete(null);
    }
  };

  const formatSeconds = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, "0") + ":" : ""}${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const shiftViewDate = (dayDelta: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + dayDelta);
    setViewDate(d.toISOString().split("T")[0]);
  };

  const handleTogglePlay = () => {
    const el = audioRef.current;
    if (el) {
      if (isPlaying) el.pause();
      else void el.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (next: number) => {
    setVolume(next);
    if (audioRef.current) audioRef.current.volume = next;
  };

  const handleCompleteFocusTask = async (task: Task) => {
    await updateTaskStatus(task);
    setFocusedTaskId(null);
  };

  if (isAuthLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-[#f1f5f9] ${promptFont.className}`}
      >
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  const tasksToDisplay = tasks.filter((t) => t.date === viewDate);
  const isViewingToday = viewDate === getTodayString();
  const focusedTask = focusedTaskId
    ? tasks.find((t) => t.id === focusedTaskId)
    : null;

  const themeClass = isDarkMode
    ? "bg-[#0f172a] text-slate-100"
    : "bg-[#f1f5f9] text-[#1e293b]";

  return (
    <div
      className={`min-h-screen flex flex-col items-center py-8 md:py-12 px-4 md:px-6 transition-colors duration-500 pb-28 md:pb-24 ${themeClass} ${promptFont.className}`}
    >
      <div
        className={`fixed top-0 left-0 w-full h-1 bg-gradient-to-r ${
          isDarkMode
            ? "from-indigo-600 to-purple-600"
            : "from-blue-400 to-indigo-400"
        }`}
      />

      <TopNavigation
        onSignOut={() => {
          void supabase.auth.signOut();
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="w-full max-w-2xl space-y-4 md:space-y-6 mt-14 md:mt-10">
        <HeaderClock
          isDarkMode={isDarkMode}
          userEmailPrefix={user?.email?.split("@")[0]}
          time={time}
          viewDate={viewDate}
        />

        <TaskList
          isDarkMode={isDarkMode}
          viewDate={viewDate}
          onShiftViewDate={shiftViewDate}
          isViewingToday={isViewingToday}
          tasks={tasksToDisplay}
          formatSeconds={formatSeconds}
          onToggleComplete={updateTaskStatus}
          onToggleTimer={toggleTimer}
          onPomodoro={setPomodoro}
          onFocus={setFocusedTaskId}
          onRequestDelete={setTaskToDelete}
          inputSlot={
            isViewingToday ? (
              <TaskInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={addTask}
                isDarkMode={isDarkMode}
              />
            ) : undefined
          }
        />
      </main>

      <MusicPlayer
        ref={audioRef}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isDarkMode={isDarkMode}
      />

      {focusedTask && (
        <FocusModal
          task={focusedTask}
          isDarkMode={isDarkMode}
          formatSeconds={formatSeconds}
          onClose={() => setFocusedTaskId(null)}
          onToggleTimer={toggleTimer}
          onCompleteAndClose={handleCompleteFocusTask}
        />
      )}

      <DeleteModal
        isOpen={taskToDelete !== null}
        isDarkMode={isDarkMode}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => void deleteTask()}
      />
    </div>
  );
}
