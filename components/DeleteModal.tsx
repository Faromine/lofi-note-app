"use client";

import { Trash2 } from "lucide-react";

export interface DeleteModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteModal({
  isOpen,
  isDarkMode,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-sm bg-slate-900/20">
      <div
        className={`w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl ${
          isDarkMode
            ? "bg-slate-800 border border-slate-700"
            : "bg-white border border-slate-100"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform hover:rotate-12">
          <Trash2 size={32} />
        </div>
        <h3
          id="delete-modal-title"
          className={`text-xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          ลบ Task นี้จริงหรอ?
        </h3>
        <p className="text-sm text-slate-500 mb-6 italic">
          ข้อมูลในระบบคลาวด์จะถูกลบทิ้งถาวรนะ
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              isDarkMode
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-medium bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all"
          >
            ลบเลย
          </button>
        </div>
      </div>
    </div>
  );
}
