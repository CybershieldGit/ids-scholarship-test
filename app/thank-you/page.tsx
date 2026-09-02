"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AssessmentNavbar from "@/components/AssessmentNavbar";
import { TestResultPayload } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  PhoneCall,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  Building,
  Sparkles,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ThankYouPage() {
  const router = useRouter();
  const [result, setResult] = useState<TestResultPayload | null>(null);
  const [isViolation, setIsViolation] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasInitializedRef.current) return;

    const stored = sessionStorage.getItem("ids_test_result");
    
    // Protection: If no completed test result exists, redirect to home page immediately
    if (!stored) {
      router.replace("/");
      return;
    }

    try {
      const parsed: TestResultPayload = JSON.parse(stored);
      setResult(parsed);
      hasInitializedRef.current = true;

      // Trigger Celebration Confetti ONLY if score is 20% or above
      const scorePct = typeof parsed?.score_percentage === "number" ? parsed.score_percentage : Number(parsed?.score_percentage) || 0;
      if (scorePct >= 20) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#EA2525", "#3b82f6", "#10b981", "#f59e0b"],
        });
      }
    } catch {
      router.replace("/");
      return;
    }

    if (sessionStorage.getItem("ids_test_violation") === "true") {
      setIsViolation(true);
    }

    setIsCheckingAccess(false);

    // Memory Disposal: Clear all sensitive intermediate session items and local storage
    try {
      sessionStorage.removeItem("ids_student_lead");
      sessionStorage.removeItem("ids_test_answers");
      sessionStorage.removeItem("ids_test_start_time");
      sessionStorage.removeItem("ids_test_strikes");
      localStorage.clear();
    } catch {}

    // Cleanup session result when user leaves / closes tab
    const handleLeave = () => {
      try {
        sessionStorage.removeItem("ids_test_result");
        sessionStorage.removeItem("ids_test_violation");
      } catch {}
    };

    window.addEventListener("pagehide", handleLeave);
    window.addEventListener("beforeunload", handleLeave);

    return () => {
      window.removeEventListener("pagehide", handleLeave);
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [router]);

  // Loading / Access Guard Check
  if (isCheckingAccess || !result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-[#EA2525] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Verifying assessment session...</p>
        </div>
      </div>
    );
  }

  const scorePercentage = typeof result.score_percentage === "number" ? result.score_percentage : Number(result.score_percentage) || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between select-none">
      <AssessmentNavbar studentName={result.full_name} />

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          {/* Success Check Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            {scorePercentage >= 20 && (
              <div className="absolute -top-1 -right-1 bg-[#EA2525] text-white p-1 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <span
              className={`text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border ${
                isViolation
                  ? "text-amber-800 bg-amber-50 border-amber-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}
            >
              {isViolation ? "Assessment Submitted (Violations Logged)" : "Assessment Completed & Recorded"}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Thank You, {result.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Your test has been successfully submitted and evaluated.
            </p>
          </div>

          {/* Prominent Score Card Box */}
          <div className="bg-gradient-to-br from-red-50 via-white to-slate-50 border border-red-200/80 rounded-2xl p-5 text-center shadow-xs space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Assessment Performance Score
            </p>

            <div className="flex items-center justify-center gap-3 py-1">
              <div className="text-4xl sm:text-5xl font-black text-[#EA2525]">
                {scorePercentage}%
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-3 border-t border-red-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
              <div>
                <p className="text-slate-400 text-[10px]">Attempted</p>
                <p className="font-bold text-slate-900 text-sm">{result.attempted} / {result.total_questions}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Correct</p>
                <p className="font-bold text-emerald-600 text-sm">{result.correct_answers}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Time Taken</p>
                <p className="font-bold text-slate-900 text-sm">{result.time_taken_seconds}s</p>
              </div>
            </div>
          </div>

          {/* Counselor Call Notice Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Scholarship Tier Verification</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our Senior Counselor will contact you on <strong className="text-slate-900 font-bold whitespace-nowrap">+91 {result.phone}</strong> with your achieved scholarship tier based on your test score.
            </p>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#EA2525]" />
                <span>Response Time: <strong>Within 24 Hours</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[#EA2525]" />
                <span>Helpline: <strong className="whitespace-nowrap">+91 98765 43210</strong></span>
              </div>
            </div>
          </div>

          {/* Fast Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <a
              href="https://idigitalstudies.com"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/40 text-left transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#EA2525] transition">Visit Website</p>
                <p className="text-[10px] text-slate-500">Explore courses & placements</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#EA2525]" />
            </a>

            <a
              href="https://idigitalstudies.com/courses"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/40 text-left transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#EA2525] transition">Course Curriculum</p>
                <p className="text-[10px] text-slate-500">6-Month Digital Marketing Master</p>
              </div>
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#EA2525]" />
            </a>
          </div>

          {/* Campus Footnote */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Campus: Noida Sector 62, Delhi NCR</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Institute of Digital Studies (IDS). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
