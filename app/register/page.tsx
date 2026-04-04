"use client";

import React, { useState } from 'react';
import Link from 'next/link'; // นำเข้า Link สำหรับเปลี่ยนหน้า
import { Prompt } from 'next/font/google';
import { Headphones, Mail, Lock, ArrowRight, Loader2, CheckCircle2, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

const promptFont = Prompt({ 
  weight: ['300', '400', '500', '600'],
  subsets: ['latin', 'thai'],
  display: 'swap',
});

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      
      setIsSuccess(true); // เปลี่ยนหน้าจอเป็นสถานะสำเร็จ
    } catch (error: any) {
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 ${promptFont.className}`}>
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-400" />
      <div className="absolute w-[500px] h-[500px] bg-green-400/20 rounded-full blur-[100px] -top-20 -left-20 mix-blend-multiply opacity-50 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[100px] bottom-10 right-10 mix-blend-multiply opacity-50 animate-pulse" />

      <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50 border border-white relative z-10">
        
        {isSuccess ? (
          // หน้าจอแสดงความสำเร็จ
          <div className="flex flex-col items-center text-center py-6">
            <div className="p-4 bg-green-500/10 text-green-500 rounded-full mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">สมัครสมาชิกสำเร็จ!</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              กรุณาตรวจสอบกล่องจดหมายอีเมลของคุณ เพื่อคลิกลิงก์ยืนยันตัวตน (หากไม่พบโปรดเช็คโฟลเดอร์ Junk/Spam)
            </p>
            <Link 
              href="/login"
              className="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl transition-all font-semibold"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          // หน้าจอสมัครสมาชิก
          <>
            <div className="flex flex-col items-center mb-10">
              <div className="p-4 bg-teal-500/10 text-teal-600 rounded-2xl mb-4 shadow-inner">
                <UserPlus size={32} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-[0.2em] uppercase text-slate-800">
                Join Lofi Note
              </h2>
              <p className="text-sm text-slate-500 mt-2 font-light">
                สร้างพื้นที่โฟกัสของคุณ
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all text-slate-700"
                    placeholder="อีเมลของคุณ"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all text-slate-700"
                    placeholder="รหัสผ่าน (6 ตัวอักษรขึ้นไป)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-teal-600 text-white py-4 rounded-2xl transition-all shadow-lg hover:shadow-teal-500/30 disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><span className="font-semibold">ลงทะเบียน</span><ArrowRight size={20} /></>}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm text-slate-500 hover:text-teal-600 transition-colors font-medium">
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}