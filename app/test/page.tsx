"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AssessmentNavbar from "@/components/AssessmentNavbar";
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
} from "lucide-react";

export default function TestEnginePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentLead | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [remainingSeconds, setRemainingSeconds] = useState(TEST_DURATION_MINUTES * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // 1. Initial Load & Auth Check
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedStudent = sessionStorage.getItem("ids_student_lead");
    if (!storedStudent) {
      router.push("/");
      return;
    }

    try {
      const parsedStudent = JSON.parse(storedStudent);
      setStudent(parsedStudent);
    } catch {
      router.push("/");
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
  }, [router]);

  // 2. Final Submission Handler
  const executeSubmission = useCallback(async () => {
    if (!student) return;
    setIsSubmitting(true);

    const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // Calculate lightweight lead payload
    const payload = calculateTestResults(
      student,
      SCHOLARSHIP_QUESTIONS,
      answers,
      timeTakenSeconds
    );

    console.log("[IDS Scholarship Test] Final Client-Calculated Lead Payload:", payload);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("ids_test_result", JSON.stringify(payload));
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
  }, [student, answers, router]);

  // 3. Countdown Timer
  useEffect(() => {
    if (remainingSeconds <= 0) {
      executeSubmission();
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          executeSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, executeSubmission]);

  // 4. Handle Option Select
  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    const question = SCHOLARSHIP_QUESTIONS[currentIndex];
    const newAnswers = { ...answers, [question.id]: key };
    setAnswers(newAnswers);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ids_test_answers", JSON.stringify(newAnswers));
    }
  };

  // 5. Clear Current Option
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
          <p className="text-sm text-slate-500 font-medium">Initializing test environment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = SCHOLARSHIP_QUESTIONS[currentIndex];
  const totalQuestions = SCHOLARSHIP_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar with Timer & Student Name */}
      <AssessmentNavbar
        studentName={student.full_name}
        remainingSeconds={remainingSeconds}
        showTimer={true}
      />

      {/* Main Test Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Progress Bar Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>
              Question <strong className="text-slate-900">{currentIndex + 1}</strong> of {totalQuestions}
            </span>
            <span className="text-[#EA2525]">
              {answeredCount} of {totalQuestions} Answered ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#EA2525] to-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Active Question Card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              {/* Question Header */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                <span className="inline-flex items-center gap-1.5 bg-red-50 text-[#EA2525] px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                  {currentQuestion.category || "General Digital Aptitude"}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  QID #{currentQuestion.id}
                </span>
              </div>

              {/* Question Title */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
                {currentQuestion.text}
              </h2>

              {/* 4 Options Grid */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt: QuestionOption) => {
                  const isSelected = answers[currentQuestion.id] === opt.key;

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      type="button"
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer group ${
                        isSelected
                          ? "bg-red-50/70 border-[#EA2525] ring-2 ring-red-200 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Option Key Badge (A, B, C, D) */}
                      <span
                        className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "bg-[#EA2525] text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                        }`}
                      >
                        {opt.key}
                      </span>

                      {/* Option Text */}
                      <span
                        className={`text-sm sm:text-base pt-0.5 leading-relaxed ${
                          isSelected ? "font-semibold text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-8 mt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {answers[currentQuestion.id] && (
                    <button
                      onClick={handleClearOption}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                      title="Clear your answer for this question"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Choice</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl bg-[#EA2525] hover:bg-red-700 text-white transition shadow-md shadow-red-500/25"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Test</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Question Navigator Grid Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Question Navigator</h3>
                <span className="text-xs text-slate-500">{answeredCount}/{totalQuestions} Done</span>
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {SCHOLARSHIP_QUESTIONS.map((q, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = answers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      type="button"
                      className={`h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? "ring-2 ring-[#EA2525] bg-red-50 text-[#EA2525] font-extrabold shadow-xs"
                          : isAnswered
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-emerald-600"></div>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-200"></div>
                  <span>Pending ({totalQuestions - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-red-50 border border-[#EA2525]"></div>
                  <span>Current Question</span>
                </div>
              </div>

              {/* Final Submit Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Assessment</span>
                </button>
              </div>
            </div>

            {/* Quick Helpline Box */}
            <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-500">
              <p>Need assistance during the test?</p>
              <p className="font-semibold text-slate-700 mt-0.5">Call IDS Support: +91 98765 43210</p>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* SUBMISSION CONFIRMATION MODAL */}
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
                onClick={executeSubmission}
                disabled={isSubmitting}
                className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? "Evaluating Responses..." : "Yes, Submit My Test"}
              </button>

              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2.5 px-4 rounded-xl transition"
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
