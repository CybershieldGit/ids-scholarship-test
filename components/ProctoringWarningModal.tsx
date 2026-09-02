"use client";

import { AlertTriangle, ShieldAlert, XCircle } from "lucide-react";

interface ProctoringWarningModalProps {
  strikeCount: number;
  maxStrikes: number;
  onResume: () => void;
}

export default function ProctoringWarningModal({
  strikeCount,
  maxStrikes,
  onResume,
}: ProctoringWarningModalProps) {
  const isFinalWarning = strikeCount === maxStrikes - 1;
  const remainingStrikes = Math.max(0, maxStrikes - strikeCount);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-300 animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#EA2525] flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Strike Pills */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {Array.from({ length: maxStrikes }).map((_, index) => {
            const isViolated = index < strikeCount;
            return (
              <div
                key={index}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isViolated
                    ? "w-8 bg-[#EA2525]"
                    : "w-6 bg-slate-200"
                }`}
              />
            );
          })}
        </div>

        {/* Header */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 text-center">
          {isFinalWarning ? "🚨 FINAL WARNING" : "⚠️ Proctoring Alert"}
        </h3>

        <div className="mt-2 text-center">
          <span className="inline-block bg-red-50 text-[#EA2525] text-xs font-bold px-3 py-1 rounded-full border border-red-200">
            Violation {strikeCount} of {maxStrikes}
          </span>
        </div>

        {/* Warning Text */}
        <div className="mt-4 bg-red-50/70 border border-red-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p className="font-semibold text-red-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#EA2525] shrink-0" />
            <span>Tab / App Switching is Strictly Prohibited!</span>
          </p>
          <p>
            You navigated away from the assessment window. All tab switches, app switching, and window minimizing are continuously monitored and logged.
          </p>
          {isFinalWarning ? (
            <p className="font-bold text-red-700 pt-1 border-t border-red-200">
              ⚠️ If you leave this screen one more time, your assessment will be immediately terminated and submitted automatically!
            </p>
          ) : (
            <p className="text-slate-600 pt-1 border-t border-red-200">
              You have <strong>{remainingStrikes}</strong> remaining attempt(s) before automatic submission.
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={onResume}
            type="button"
            className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl transition shadow-lg shadow-red-500/25 cursor-pointer"
          >
            I Understand & Resume Test
          </button>
        </div>
      </div>
    </div>
  );
}
