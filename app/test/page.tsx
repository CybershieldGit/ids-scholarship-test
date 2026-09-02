"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AssessmentNavbar from "@/components/AssessmentNavbar";
import ProctoringWarningModal from "@/components/ProctoringWarningModal";
import FullscreenPromptModal from "@/components/FullscreenPromptModal";
import ForensicWatermark from "@/components/ForensicWatermark";
import { SCHOLARSHIP_QUESTIONS, TEST_DURATION_MINUTES } from "@/data/questions";
import { StudentLead, QuestionOption } from "@/lib/types";
import { calculateTestResults } from "@/lib/grader";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const MAX_STRIKES = 3;

export default function TestEnginePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentLead | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [remainingSeconds, setRemainingSeconds] = useState(TEST_DURATION_MINUTES * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proctoring States
  const [strikes, setStrikes] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const lastViolationTimeRef = useRef<number>(0);
  const isSubmittingRef = useRef<boolean>(false);

  // 1. Initial Load & Auth Check
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedStudent = sessionStorage.getItem("ids_student_lead");
    if (!storedStudent) {
      router.replace("/");
      return;
    }

    try {
      const parsedStudent: StudentLead = JSON.parse(storedStudent);
      
      // Strict Demographics Route Protection: Ensure both valid name and phone number exist
      const cleanPhone = (parsedStudent.phone || "").replace(/\D/g, "");
      const cleanName = (parsedStudent.full_name || "").trim();

      if (!cleanName || cleanName.length < 2 || !cleanPhone || cleanPhone.length < 10) {
        sessionStorage.removeItem("ids_student_lead");
        router.replace("/");
        return;
      }

      setStudent(parsedStudent);
    } catch {
      sessionStorage.removeItem("ids_student_lead");
      router.replace("/");
      return;
    }

    // Load start time
    const storedStartTime = sessionStorage.getItem("ids_test_start_time");
    if (storedStartTime) {
      const startMs = parseInt(storedStartTime, 10);
      startTimeRef.current = startMs;
      const elapsedSecs = Math.floor((Date.now() - startMs) / 1000);
      const remaining = Math.max(0, TEST_DURATION_MINUTES * 60 - elapsedSecs);
      setRemainingSeconds(remaining);
    } else {
      const now = Date.now();
      startTimeRef.current = now;
      sessionStorage.setItem("ids_test_start_time", now.toString());
    }

    // Restore any saved answers
    const storedAnswers = sessionStorage.getItem("ids_test_answers");
    if (storedAnswers) {
      try {
        setAnswers(JSON.parse(storedAnswers));
      } catch {}
    }

    // Check device type: show fullscreen prompt for desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      setShowFullscreenPrompt(true);
    } else {
      setIsProctoringActive(true);
    }
  }, [router]);

  // 2. Final Submission Handler
  const executeSubmission = useCallback(
    async (submissionReason?: "manual" | "timeout" | "violation") => {
      if (!student || isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Read final strikes count
      const finalStrikes = parseInt(sessionStorage.getItem("ids_test_strikes") || "0", 10);

      // Determine final status
      let statusText = "Completed";
      if (submissionReason === "violation") {
        statusText = "Auto-Submitted (Violation)";
      } else if (submissionReason === "timeout") {
        statusText = "Auto-Submitted (Timeout)";
      }

      // Calculate lightweight lead payload with tab switch count and status
      const payload = calculateTestResults(
        student,
        SCHOLARSHIP_QUESTIONS,
        answers,
        timeTakenSeconds,
        finalStrikes,
        statusText
      );

      console.log("[IDS Scholarship Test] Final Lead Payload:", payload, "Reason:", submissionReason);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("ids_test_result", JSON.stringify(payload));
        if (submissionReason === "violation") {
          sessionStorage.setItem("ids_test_violation", "true");
        }
        // Dispose interim answer states
        sessionStorage.removeItem("ids_test_answers");
        sessionStorage.removeItem("ids_test_start_time");
      }

      // Exit fullscreen safely if active
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch {}
      }

      // Direct Google Sheets Ingestion (100% Serverless)
      const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          console.log("[IDS Scholarship Test] Lead sent to Google Sheet successfully!");
        } catch (err) {
          console.warn("[IDS Scholarship Test] Error pushing to Google Sheet:", err);
        }
      }

      router.push("/thank-you");
    },
    [student, answers, router]
  );

  // 3. Proctoring Violation Trigger (Cross-platform: Desktop Tab Switch & Mobile App Switch)
  const handleProctoringViolation = useCallback(() => {
    if (!isProctoringActive || isSubmittingRef.current) return;

    // Debounce to prevent duplicate events within 1.5 seconds
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 1500) return;
    lastViolationTimeRef.current = now;

    setStrikes((prev) => {
      const nextStrikes = prev + 1;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("ids_test_strikes", nextStrikes.toString());
      }

      if (nextStrikes >= MAX_STRIKES) {
        // Auto-submit immediately on 3rd violation
        executeSubmission("violation");
      } else {
        // Show Strike 1 or Strike 2 Warning Modal
        setShowWarningModal(true);
      }
      return nextStrikes;
    });
  }, [isProctoringActive, executeSubmission]);

  // 4. Register Browser & Visibility Event Listeners
  useEffect(() => {
    if (!isProctoringActive) return;

    // A. Tab / App Visibility Change (Mobile App Switch & Desktop Tab Switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left tab or switched mobile app
        handleProctoringViolation();
      }
    };

    // B. Window Blur (Desktop Click Outside / Snipping Tool / App Switch)
    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
      handleProctoringViolation();
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    // C. Pagehide (Mobile browser backgrounding)
    const handlePageHide = () => {
      setIsWindowBlurred(true);
      handleProctoringViolation();
    };

    // D. Fullscreen Exit Detection (Desktop)
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreenActive(isFull);
      if (!isFull && !isSubmittingRef.current) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) {
          setShowFullscreenPrompt(true);
          handleProctoringViolation();
        }
      }
    };

    // E. Disable Copy / Paste / Context Menu / Shortcuts / PrintScreen
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+P, Ctrl+S, Ctrl+A
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "u", "a", "s", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      // Block F12, DevTools
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
      }
      // Intercept PrintScreen
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("Screenshots are strictly prohibited during the IDS Assessment.");
          }
        } catch {}
        handleProctoringViolation();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("Screenshots are strictly prohibited during the IDS Assessment.");
          }
        } catch {}
        handleProctoringViolation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 3) {
        e.preventDefault();
        setIsWindowBlurred(true);
        handleProctoringViolation();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 3) {
        e.preventDefault();
        setIsWindowBlurred(true);
        handleProctoringViolation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCutPaste);
    document.addEventListener("cut", handleCopyCutPaste);
    document.addEventListener("paste", handleCopyCutPaste);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCutPaste);
      document.removeEventListener("cut", handleCopyCutPaste);
      document.removeEventListener("paste", handleCopyCutPaste);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isProctoringActive, handleProctoringViolation]);

  // 5. Enter Fullscreen Mode Handler
  const handleEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {}
    setShowFullscreenPrompt(false);
    setIsFullscreenActive(true);
    setIsProctoringActive(true);
  };

  // 6. Countdown Timer
  useEffect(() => {
    if (remainingSeconds <= 0) {
      executeSubmission("timeout");
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          executeSubmission("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, executeSubmission]);

  // 7. Handle Option Select
  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    const question = SCHOLARSHIP_QUESTIONS[currentIndex];
    const newAnswers = { ...answers, [question.id]: key };
    setAnswers(newAnswers);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ids_test_answers", JSON.stringify(newAnswers));
    }
  };

  // 8. Clear Current Option
  const handleClearOption = () => {
    const question = SCHOLARSHIP_QUESTIONS[currentIndex];
    const newAnswers = { ...answers };
    delete newAnswers[question.id];
    setAnswers(newAnswers);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ids_test_answers", JSON.stringify(newAnswers));
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#EA2525] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 font-medium">Initializing secure test environment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = SCHOLARSHIP_QUESTIONS[currentIndex];
  const totalQuestions = SCHOLARSHIP_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between select-none relative overflow-hidden">
      {/* Dynamic Forensic Anti-Leak Watermark */}
      <ForensicWatermark
        studentName={student.full_name}
        studentPhone={student.phone}
      />

      {/* Top Navbar with Timer & Student Name */}
      <AssessmentNavbar
        studentName={student.full_name}
        remainingSeconds={remainingSeconds}
        showTimer={true}
      />

      {/* Main Test Layout */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex-1 w-full">
        {/* Progress Bar & Proctoring Badge */}
        <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
            <span>
              Question <strong className="text-slate-900 font-extrabold text-sm sm:text-base">{currentIndex + 1}</strong> of {totalQuestions}
            </span>

            {/* Live Proctoring Status Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Proctoring Active</span>
              </div>

              {strikes > 0 && (
                <div className="flex items-center gap-1 text-red-700 bg-red-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold border border-red-200 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                  <span>Strikes: {strikes}/{MAX_STRIKES}</span>
                </div>
              )}

              <span className="text-[#EA2525] text-xs sm:text-sm font-extrabold">
                {answeredCount}/{totalQuestions} ({progressPercent}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#EA2525] to-red-600 h-2 sm:h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left: Active Question Card */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm">
              {/* Question Header */}
              <div className="flex items-center justify-between gap-3 mb-3.5 pb-3 sm:mb-5 sm:pb-4 border-b border-slate-100">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-red-50 text-[#EA2525] px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold border border-red-100">
                  {currentQuestion.category || "General Digital Aptitude"}
                </span>
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  QID #{currentQuestion.id}
                </span>
              </div>

              {/* Question Title */}
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug sm:leading-relaxed mb-4 sm:mb-6 select-none">
                {currentQuestion.text}
              </h2>

              {/* 4 Options Grid */}
              <div className="space-y-2.5 sm:space-y-3.5">
                {currentQuestion.options.map((opt: QuestionOption) => {
                  const isSelected = answers[currentQuestion.id] === opt.key;

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      type="button"
                      className={`w-full text-left p-3 sm:p-4.5 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-start gap-3 sm:gap-4 cursor-pointer group select-none ${
                        isSelected
                          ? "bg-red-50/80 border-[#EA2525] ring-2 ring-red-200 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Option Key Badge (A, B, C, D) */}
                      <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-sm sm:text-base flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "bg-[#EA2525] text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                        }`}
                      >
                        {opt.key}
                      </span>

                      {/* Option Text */}
                      <span
                        className={`text-sm sm:text-lg pt-0.5 sm:pt-1 leading-snug sm:leading-relaxed ${
                          isSelected ? "font-bold text-slate-900" : "font-medium text-slate-800"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 sm:pt-8 sm:mt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Previous</span>
                  </button>

                  {answers[currentQuestion.id] && (
                    <button
                      onClick={handleClearOption}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold px-3 py-2 sm:py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Clear your answer for this question"
                    >
                      <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="inline-flex items-center gap-1 text-xs sm:text-base font-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-base font-black px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#EA2525] hover:bg-red-700 text-white transition shadow-md shadow-red-500/25 cursor-pointer"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Submit Test</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Question Navigator Grid Card */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2.5 sm:mb-4 sm:pb-3 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Question Navigator</h3>
                <span className="text-xs sm:text-sm font-semibold text-slate-500">{answeredCount}/{totalQuestions} Done</span>
              </div>

              {/* Number Grid in 3 rows (7 columns) */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {SCHOLARSHIP_QUESTIONS.map((q, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = answers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      type="button"
                      className={`h-8 sm:h-9 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? "ring-2 ring-[#EA2525] bg-red-50 text-[#EA2525] font-black shadow-xs"
                          : isAnswered
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend (1 Single Line) */}
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-600 pt-2.5 sm:pt-3 border-t border-slate-100 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></div>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></div>
                  <span>Pending ({totalQuestions - answeredCount})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-100 border border-[#EA2525] shrink-0"></div>
                  <span>Current</span>
                </div>
              </div>

              {/* Final Submit Button */}
              <div className="mt-4 pt-3 sm:mt-6 sm:pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-black text-sm sm:text-base py-3 sm:py-3.5 px-4 rounded-xl transition shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Submit Assessment</span>
                </button>
              </div>
            </div>

            {/* Anti-Cheat Advisory Box */}
            <div className="bg-red-50/60 border border-red-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-slate-700 space-y-1">
              <p className="font-extrabold text-red-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-[#EA2525]" />
                <span>Anti-Cheat Proctoring Active</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Do not switch tabs or apps. 3 strikes will automatically submit your assessment.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 0. ANTI-SCREEN CAPTURE / SNIPPING TOOL BLUR OVERLAY */}
      {/* ========================================================================= */}
      {isWindowBlurred && !showWarningModal && !showSubmitModal && !showFullscreenPrompt && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-4 select-none">
          <div className="text-center text-white space-y-3 p-6 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-[#EA2525] border border-red-500/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold">Screen Capture Protected</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assessment content is hidden while window is unfocused or screen grabber is active. Click anywhere to return to test.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PROCTORING WARNING MODAL (STRIKE 1 & 2) */}
      {/* ========================================================================= */}
      {showWarningModal && (
        <ProctoringWarningModal
          strikeCount={strikes}
          maxStrikes={MAX_STRIKES}
          onResume={() => setShowWarningModal(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN PROMPT MODAL (DESKTOP) */}
      {/* ========================================================================= */}
      {showFullscreenPrompt && (
        <FullscreenPromptModal
          isResume={isProctoringActive}
          onEnterFullscreen={handleEnterFullscreen}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. SUBMISSION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#EA2525] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center">
              Submit Scholarship Test?
            </h3>

            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              You have answered <strong className="text-slate-900">{answeredCount}</strong> out of{" "}
              <strong className="text-slate-900">{totalQuestions}</strong> questions.
              {answeredCount < totalQuestions && (
                <span className="block text-amber-600 font-semibold mt-1">
                  ⚠️ You have {totalQuestions - answeredCount} unanswered question(s).
                </span>
              )}
            </p>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => executeSubmission("manual")}
                disabled={isSubmitting}
                className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? "Evaluating Responses..." : "Yes, Submit My Test"}
              </button>

              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                Continue Answering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
