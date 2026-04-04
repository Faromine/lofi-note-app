"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // นำเข้า Link สำหรับเปลี่ยนหน้า
import { Prompt } from 'next/font/google';
import { Headphones, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const promptFont = Prompt({ 
  weight: ['300', '400', '500', '600'],
  subsets: ['latin', 'thai'],
  display: 'swap',
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push('/'); // ล็อกอินผ่าน กลับไปหน้าหลัก
    } catch (error: any) {
      setErrorMessage(error.message || 'รหัสผ่านผิด หรืออีเมลยังไม่ได้ลงทะเบียน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 ${promptFont.className}`}>
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400" />
      <div className="absolute w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -top-20 -left-20 mix-blend-multiply opacity-50 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[100px] bottom-10 right-10 mix-blend-multiply opacity-50 animate-pulse" />

      <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50 border border-white relative z-10">
        
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl mb-4 shadow-inner">
            <Headphones size={32} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-[0.2em] uppercase text-slate-800">
            Lofi Note
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-light">
            กลับเข้าสู่พื้นที่แห่งความสงบ
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-slate-700"
                placeholder="อีเมลของคุณ"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-slate-700"
                placeholder="รหัสผ่านของคุณ"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><span className="font-semibold">เข้าสู่ระบบ</span><ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/register" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
            ยังไม่มีบัญชี? สร้างบัญชีใหม่เลย
          </Link>
        </div>
      </div>
    </div>
  );
}