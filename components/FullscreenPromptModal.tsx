"use client";

import { Maximize2, ShieldCheck } from "lucide-react";

interface FullscreenPromptModalProps {
  isResume?: boolean;
  onEnterFullscreen: () => void;
}

export default function FullscreenPromptModal({
  isResume = false,
  onEnterFullscreen,
}: FullscreenPromptModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#EA2525] flex items-center justify-center mx-auto mb-4 border border-red-100">
          <Maximize2 className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          {isResume ? "Fullscreen Required" : "Enter Fullscreen Mode"}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {isResume
            ? "You exited fullscreen mode. To maintain test integrity, the assessment must be completed in fullscreen mode."
            : "To ensure a secure, distraction-free environment, this assessment requires Fullscreen Mode. Please click the button below to start."}
        </p>

        {/* Security Feature Checklist */}
        <div className="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 text-left space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Anti-cheating & proctoring active</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tab & app switching monitored (Max 3 strikes)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Copy, paste & right-click disabled</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          <button
            onClick={onEnterFullscreen}
            type="button"
            className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>{isResume ? "Resume Fullscreen Test" : "Start Test in Fullscreen"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
