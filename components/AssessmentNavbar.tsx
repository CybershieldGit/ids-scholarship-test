"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, Clock, ShieldCheck, User } from "lucide-react";

interface AssessmentNavbarProps {
  studentName?: string;
  remainingSeconds?: number;
  showTimer?: boolean;
}

export default function AssessmentNavbar({
  studentName,
  remainingSeconds,
  showTimer = false,
}: AssessmentNavbarProps) {
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isTimeCritical = remainingSeconds !== undefined && remainingSeconds <= 120; // 2 minutes

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Logo & Portal Tag */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          <Link href="/" className="flex items-center">
            <Image
              src="/IDS_LOGO.svg"
              width={120}
              height={36}
              alt="Institute of Digital Studies"
              priority
              className="h-8 sm:h-9 w-auto"
            />
          </Link>
          <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
          <div className="hidden sm:flex items-center gap-1.5 bg-red-50 text-[#EA2525] px-2.5 py-1 rounded-full text-xs font-semibold border border-red-100">
            <Award className="w-3.5 h-3.5" />
            <span>Scholarship Portal</span>
          </div>
        </div>

        {/* Right: Live Timer or Student Name */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showTimer && remainingSeconds !== undefined && (
            <div
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-sm sm:text-lg border transition shadow-xs ${
                isTimeCritical
                  ? "bg-red-50 text-red-600 border-red-300 animate-pulse"
                  : "bg-slate-900 text-white border-slate-800"
              }`}
            >
              <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${isTimeCritical ? "text-red-600" : "text-red-400"}`} />
              <span className="font-mono tracking-wider">{formatTime(remainingSeconds)}</span>
            </div>
          )}

          {studentName ? (
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-slate-200">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate">{studentName}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official IDS Assessment 2026</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
