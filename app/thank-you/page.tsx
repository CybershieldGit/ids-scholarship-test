"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AssessmentNavbar from "@/components/AssessmentNavbar";
import { TestResultPayload } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  PhoneCall,
  Download,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ThankYouPage() {
  const [result, setResult] = useState<TestResultPayload | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("ids_test_result");
      if (stored) {
        try {
          setResult(JSON.parse(stored));
        } catch {}
      }

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#EA2525", "#3b82f6", "#10b981", "#f59e0b"],
        });
      } catch {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <AssessmentNavbar studentName={result?.full_name} />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-8">
          {/* Animated Success Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="absolute -top-1 -right-1 bg-[#EA2525] text-white p-1.5 rounded-full shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Submission Received & Recorded
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Thank You, {result?.full_name || "Applicant"}!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Your scholarship assessment answers have been received and forwarded to the{" "}
              <strong>IDS Academic & Scholarship Evaluation Committee</strong>.
            </p>
          </div>

          {/* Evaluation Under Review Box */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50/60 border border-red-200/80 rounded-2xl p-6 text-left max-w-2xl mx-auto shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-[#EA2525] flex items-center justify-center shrink-0 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Official Scorecard & Scholarship Grant Letter Under Review
                </h3>
                <p className="text-xs text-slate-500">Confidential Evaluation Pipeline</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Our Senior Academic Counselor will reach out to you via WhatsApp or Call on{" "}
              <strong className="text-slate-900 font-bold">{result?.phone || "your registered number"}</strong> shortly
              with your official evaluation scorecard and the eligible scholarship tier (Up to 100% Scholarship).
            </p>

            <div className="pt-3 border-t border-red-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#EA2525]" />
                <span>Response Time: <strong>Within 24 Hours</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#EA2525]" />
                <span>Helpline: <strong>+91 98765 43210</strong></span>
              </div>
            </div>
          </div>

          {/* What to do next */}
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Explore IDS in the Meantime
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://idigitalstudies.com"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl border border-slate-200 hover:border-red-300 hover:bg-red-50/40 text-left transition flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-[#EA2525] transition">
                    Visit Main Website
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Explore courses, placements & trainers</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#EA2525]" />
              </a>

              <a
                href="https://idigitalstudies.com/courses"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl border border-slate-200 hover:border-red-300 hover:bg-red-50/40 text-left transition flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-[#EA2525] transition">
                    View Course Modules
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">6-Month Master in Digital Marketing</p>
                </div>
                <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-[#EA2525]" />
              </a>
            </div>
          </div>

          {/* Campus Footnote */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-600" />
              <span>Campus: Noida Sector 62, Delhi NCR</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Govt. & Industry Recognized Certification</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Institute of Digital Studies (IDS). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
