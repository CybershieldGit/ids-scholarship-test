"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AssessmentNavbar from "@/components/AssessmentNavbar";
import { StudentLead } from "@/lib/types";
import { SCHOLARSHIP_QUESTIONS, TEST_DURATION_MINUTES } from "@/data/questions";
import {
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  Building,
  Users,
  BookOpen,
  X,
  Lock,
  Flame,
  FileCheck,
  MessageSquare,
  ArrowLeft,
  RotateCw,
  Edit3,
  Star,
  Zap,
  Check,
  Search,
  Share2,
  PieChart,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function RegistrationPage() {
  const router = useRouter();
  const isOtpNeeded = process.env.NEXT_PUBLIC_OTP_NEEDED === "true";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"form" | "otp">("form");

  const [formData, setFormData] = useState<StudentLead>({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    qualification: "College Student",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [otpValue, setOtpValue] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [generatedLeadId, setGeneratedLeadId] = useState("");

  const totalQuestionsCount = SCHOLARSHIP_QUESTIONS.length;
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Auto-open modal after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for Resend OTP cooldown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldown]);

  // Focus OTP input when switching to OTP screen
  useEffect(() => {
    if (modalStep === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [modalStep]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "Name must be at least 2 characters";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Phone number is required";
    } else if (cleanPhone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City / Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1 Handler: Submit Registration / Send WhatsApp OTP (or direct bypass if isOtpNeeded is false)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);
    const leadId = generatedLeadId || `IDS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // If OTP verification is disabled via flag, directly initialize test session & lead ingestion
    if (!isOtpNeeded) {
      const studentLeadData: StudentLead = {
        lead_id: leadId,
        full_name: formData.full_name.trim(),
        phone: cleanPhone,
        email: formData.email.trim().toLowerCase(),
        city: formData.city.trim(),
        qualification: formData.qualification,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("ids_student_lead", JSON.stringify(studentLeadData));
        sessionStorage.removeItem("ids_test_answers");
        sessionStorage.removeItem("ids_test_result");
        sessionStorage.removeItem("ids_test_strikes");
        sessionStorage.removeItem("ids_test_violation");
        sessionStorage.setItem("ids_test_start_time", Date.now().toString());
      }

      // Stage 1 Ingestion: Push initial lead demographics to Google Sheets immediately
      const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          const initialLeadPayload = {
            action: "INIT_LEAD",
            lead_id: leadId,
            status: "Test In Progress",
            full_name: studentLeadData.full_name,
            phone: studentLeadData.phone,
            email: studentLeadData.email,
            city: studentLeadData.city,
            qualification: studentLeadData.qualification,
            total_questions: totalQuestionsCount,
            attempted: "-",
            correct_answers: "-",
            wrong_answers: "-",
            unattempted: "-",
            score_percentage: "-",
            time_taken_seconds: "-",
            tab_switch_count: "-",
          };

          fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(initialLeadPayload),
          }).catch((err) => {
            console.warn("[IDS Scholarship Test] Initial lead ingestion warning:", err);
          });
        } catch (err) {
          console.warn("[IDS Scholarship Test] Error dispatching initial lead:", err);
        }
      }

      setIsModalOpen(false);
      router.push("/test");
      return;
    }

    setIsSendingOtp(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setOtpError(data?.error || "Failed to send WhatsApp OTP. Please try again.");
        setIsSendingOtp(false);
        return;
      }

      setGeneratedLeadId(leadId);
      setOtpToken(data.token);
      setOtpCooldown(data.cooldown || 30);
      setModalStep("otp");
      setOtpValue("");
    } catch (err: any) {
      console.error("Error calling send-otp API:", err);
      setOtpError("Network error. Please check your connection and try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2 Handler: Verify WhatsApp OTP & Start Test
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.trim().length !== 6) {
      setOtpError("Please enter the complete 6-digit verification code");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: otpValue.trim(),
          token: otpToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setOtpError(data?.error || "Incorrect OTP entered. Please check and try again.");
        setIsVerifyingOtp(false);
        return;
      }

      // 1. Save verified student details in sessionStorage
      const leadId = generatedLeadId || `IDS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const studentLeadData: StudentLead = {
        lead_id: leadId,
        full_name: formData.full_name.trim(),
        phone: cleanPhone,
        email: formData.email.trim().toLowerCase(),
        city: formData.city.trim(),
        qualification: formData.qualification,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("ids_student_lead", JSON.stringify(studentLeadData));
        sessionStorage.removeItem("ids_test_answers");
        sessionStorage.removeItem("ids_test_result");
        sessionStorage.removeItem("ids_test_strikes");
        sessionStorage.removeItem("ids_test_violation");
        sessionStorage.setItem("ids_test_start_time", Date.now().toString());
      }

      // 2. Stage 1 Ingestion: Push initial lead demographics to Google Sheets immediately
      const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          const initialLeadPayload = {
            action: "INIT_LEAD",
            lead_id: leadId,
            status: "Test In Progress",
            full_name: studentLeadData.full_name,
            phone: studentLeadData.phone,
            email: studentLeadData.email,
            city: studentLeadData.city,
            qualification: studentLeadData.qualification,
            total_questions: totalQuestionsCount,
            attempted: "-",
            correct_answers: "-",
            wrong_answers: "-",
            unattempted: "-",
            score_percentage: "-",
            time_taken_seconds: "-",
            tab_switch_count: "-",
          };

          fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(initialLeadPayload),
          }).catch((err) => {
            console.warn("[IDS Scholarship Test] Initial lead ingestion warning:", err);
          });
        } catch (err) {
          console.warn("[IDS Scholarship Test] Error dispatching initial lead:", err);
        }
      }

      // 3. Navigate to test session
      router.push("/test");
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setOtpError("Verification failed due to network error. Please try again.");
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-agency-grid bg-[#fcfcfd] text-slate-900 flex flex-col justify-between select-none relative overflow-x-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-agency-glow pointer-events-none -z-10" />

      <AssessmentNavbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex-1 w-full space-y-12 lg:space-y-16">
        {/* ========================================================================= */}
        {/* HERO SECTION: EDTECH AGENCY 2-COLUMN SHOWCASE (MOBILE OPTIMIZED) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Copy & Actions (7 Cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
            {/* Social Proof & Live Candidate Activity Badge */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live-pulse" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-700">48+ Candidates Testing Now</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-600">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-800 font-bold ml-0.5">4.9/5</span>
                <span>(2,400+ Evaluated)</span>
              </div>
            </div>

            {/* Mobile-Only Scaled Image (Upside of heading on Mobile) */}
            <div className="block lg:hidden w-full max-w-[280px] sm:max-w-[320px] relative my-1">
              <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/80 bg-white">
                <Image
                  src="/hero_assessment.jpg"
                  alt="Student taking Digital Marketing Scholarship Test at Institute of Digital Studies"
                  width={600}
                  height={450}
                  priority
                  className="w-full h-auto object-cover object-center"
                />
              </div>
              {/* Floating Mini Badge */}
              <div className="absolute -bottom-2 right-2 bg-slate-900/95 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md flex items-center gap-1 border border-slate-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Up to 70% Grant</span>
              </div>
            </div>

            {/* Primary Authority Heading */}
            <div className="space-y-3 w-full">
              <div className="inline-flex items-center justify-center lg:justify-start gap-1.5 text-xs font-extrabold text-[#EA2525] uppercase tracking-wider bg-red-50/80 px-3 py-1 rounded-full border border-red-200/70">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Examination Authority • 2026 Session</span>
              </div>

              <h1 className="text-4xl sm:text-4xl lg:text-[45px] font-black text-slate-900 tracking-tight leading-[1.12] sm:leading-[1.2] flex flex-col gap-1.5 sm:gap-2 items-center lg:items-start text-center lg:text-left">
                <span>Digital Marketing</span>
                <span className="text-slate-900">
                  Scholarship Test <span className="text-[#EA2525] ml-1.5 inline-block">DMST</span>
                </span>
              </h1>
            </div>

            <p className="text-base text-slate-600 max-w-xl leading-relaxed">
              Standardized online aptitude assessment for admission into advanced master programs. Score eligible marks to qualify for <strong>Up to 70% Merit Scholarship</strong>.
            </p>

            {/* Feature Highlights Strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-semibold text-slate-600">
              <div className="inline-flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#EA2525]" />
                <span>5 Mins Timed</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Scorecard</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Up to 70% Grant</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Proctored</span>
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-2 flex flex-col items-center lg:items-start gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setModalStep("form");
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#EA2525] hover:bg-red-700 text-white font-black text-lg py-3.5 px-8 rounded-2xl transition-all duration-200 shadow-xl shadow-red-500/30 cursor-pointer group animate-pulse-scale active:scale-[0.98]"
              >
                <Flame className="w-5 h-5 text-amber-300" />
                <span>Start Test ({TEST_DURATION_MINUTES} Mins)</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <span className="text-[11px] text-slate-400 font-medium">
                Free Examination • Instant Result on Submit
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-red-500/15 via-amber-500/10 to-blue-500/15 rounded-[44px] blur-2xl -z-10 opacity-70 pointer-events-none" />

            <div className="relative w-full max-w-lg">
              {/* Image Container with Smooth Rounded Edges */}
              <div className="relative overflow-hidden rounded-[32px] sm:rounded-[38px] shadow-2xl shadow-slate-200/80 border border-slate-200/80 bg-white">
                <Image
                  src="/hero_assessment.jpg"
                  alt="Student taking Digital Marketing Scholarship Test at Institute of Digital Studies"
                  width={800}
                  height={600}
                  priority
                  className="w-full h-auto object-cover object-center rounded-[32px] sm:rounded-[38px] hover:scale-103 transition-transform duration-700"
                />
              </div>

              {/* Floating Badge: Top Left */}
              <div className="absolute -top-2.5 -left-2 sm:-left-3.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/60 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA2525] animate-pulse" />
                <span className="text-xs font-black text-slate-900 tracking-wide">Up to 70% Grant</span>
              </div>

              {/* Floating Badge: Bottom Right */}
              <div className="absolute -bottom-2.5 -right-2 sm:-right-3.5 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl border border-slate-700 shadow-xl shadow-slate-900/25 flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2026 Batch Admissions</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4 AGENCY METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#EA2525] flex items-center justify-center mx-auto mb-2 border border-red-100">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{TEST_DURATION_MINUTES} Minutes</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Strict Timed Test</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{totalQuestionsCount} Questions</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Multiple Choice (MCQ)</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-100">
              <Award className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">Up to 70%</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Scholarship Tier</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-100">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">AI Proctored</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">3-Strike Anti-Cheat</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3-STEP CANDIDATE JOURNEY ROADMAP */}
        {/* ========================================================================= */}
        <section className="max-w-4xl mx-auto space-y-6 pt-2">
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Assessment Flow</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              3 Simple Steps to Your Merit Grant
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 space-y-1.5 shadow-2xs hover:border-red-200 transition">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-100 text-[#EA2525] font-black text-[10px] sm:text-xs flex items-center justify-center border border-red-200">
                01
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Quick Registration</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-snug">
                {isOtpNeeded
                  ? "Enter details & verify mobile via WhatsApp OTP."
                  : "Enter details & start test immediately."}
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 space-y-1.5 shadow-2xs hover:border-blue-200 transition">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-100 text-blue-600 font-black text-[10px] sm:text-xs flex items-center justify-center border border-blue-200">
                02
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">5-Min Assessment</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-snug">
                Answer 20 MCQs with AI proctoring & zero negative mark.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 space-y-1.5 shadow-2xs hover:border-emerald-200 transition">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-emerald-600 font-black text-[10px] sm:text-xs flex items-center justify-center border border-emerald-200">
                03
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Instant Score & Grant</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-snug">
                View live score & receive official grant letter.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXAMINATION SECURITY & EVALUATION GRID */}
        {/* ========================================================================= */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Security & Anti-Cheat Protocols */}
          <div className="bg-white border border-red-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5 hover:shadow-sm transition">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#EA2525]" />
              <span>Strict Anti-Cheat & Proctoring Rules</span>
            </h2>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-4.5 h-4.5 rounded-full bg-red-100 text-[#EA2525] flex items-center justify-center shrink-0 font-bold text-[11px] border border-red-200">1</span>
                <span><strong>Tab & App Switch Monitoring:</strong> Switching tabs on desktop or switching apps on mobile triggers an instant violation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4.5 h-4.5 rounded-full bg-red-100 text-[#EA2525] flex items-center justify-center shrink-0 font-bold text-[11px] border border-red-200">2</span>
                <span><strong>3-Strike Auto-Submission:</strong> The system allows up to 2 warnings. On the <strong>3rd violation strike</strong>, the test automatically terminates and submits immediately.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4.5 h-4.5 rounded-full bg-red-100 text-[#EA2525] flex items-center justify-center shrink-0 font-bold text-[11px] border border-red-200">3</span>
                <span><strong>No Screenshot / Copying:</strong> Right-click, clipboard copy-paste, Snipping Tool, and shortcuts are restricted.</span>
              </li>
            </ul>
          </div>

          {/* Test Pattern & Evaluation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5 hover:shadow-sm transition">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Assessment Structure & Scoring</span>
            </h2>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Curriculum Scope:</strong> Questions evaluate Search Engine Optimization (SEO), SEM, PPC Ads, Social Media, and Web Analytics.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Speed & Accuracy:</strong> 20 questions in 5 minutes (15 seconds average per question). No negative marking.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Confidential Merit Review:</strong> Test scorecard is evaluated confidentially by the Academic Committee. The senior counselor contacts qualifying candidates with their grant letter.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5-PILLAR CURRICULUM WITH INDUSTRY TOOLS TAGS */}
        {/* ========================================================================= */}
        <section id="syllabus" className="max-w-4xl mx-auto space-y-6 pt-2">
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Assessment Scope</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Curriculum & Skill Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              The 20 multiple-choice questions evaluate foundational understanding across 5 core growth pillars:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Pillar 1 */}
            <div className="bg-white border border-slate-200/90 border-t-2 border-t-[#EA2525] rounded-xl p-2.5 sm:p-3 space-y-1.5 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#EA2525] bg-red-50 px-1.5 py-0.5 rounded">01</span>
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">SEO & Search</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                Keywords, tags, backlinks & crawling.
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">Semrush</span>
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">Ahrefs</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-slate-200/90 border-t-2 border-t-blue-500 rounded-xl p-2.5 sm:p-3 space-y-1.5 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">02</span>
                <Zap className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">Google & PPC</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                Quality Score, CTR, bidding & ads.
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">Google Ads</span>
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">Meta Ads</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-slate-200/90 border-t-2 border-t-purple-500 rounded-xl p-2.5 sm:p-3 space-y-1.5 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">03</span>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">Social & Brand</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                Organic reach, hooks & distribution.
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">Instagram</span>
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">LinkedIn</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white border border-slate-200/90 border-t-2 border-t-emerald-500 rounded-xl p-2.5 sm:p-3 space-y-1.5 shadow-2xs hover:shadow-xs transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">04</span>
                <PieChart className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">Web Analytics</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                GA4 traffic, sessions & ROI metrics.
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">GA4</span>
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">GTM</span>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="bg-white border border-slate-200/90 border-t-2 border-t-amber-500 rounded-xl p-2.5 sm:p-3 space-y-1.5 shadow-2xs hover:shadow-xs transition col-span-2 sm:col-span-1 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">05</span>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">Funnels & CRO</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                A/B testing, CTA design & pages.
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">A/B Testing</span>
                <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">CRO</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE FAQ ACCORDION SECTION */}
        {/* ========================================================================= */}
        <section id="faqs" className="max-w-4xl mx-auto space-y-6 pt-2">
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Candidate Help & FAQ</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Everything you need to know about the examination guidelines, scholarship rules, and admissions verification.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What is the Digital Marketing Scholarship Test (DMST)?",
                a: "The DMST is a standardized 5-minute online aptitude assessment designed by the Institute of Digital Studies (IDS) to assess aptitude in SEO, PPC, and Digital Marketing for awarding merit grants of Up to 70%.",
              },
              {
                q: "How much scholarship can I qualify for through this test?",
                a: "Candidates can qualify for Up to 70% Merit Scholarship. The exact scholarship grant is evaluated dynamically by the Academic Committee based on your test performance, accuracy, speed, and candidate profile.",
              },
              {
                q: "Is there any negative marking in the assessment?",
                a: "No, there is zero negative marking. You are encouraged to attempt all 20 multiple-choice questions within the 5-minute allocated time limit.",
              },
              {
                q: "How will I receive my scorecard and grant letter?",
                a: "Your test scorecard and percentage are displayed immediately upon submission. A Senior Academic Counselor will reach out via WhatsApp/Phone within 24 hours to guide you through your grant verification.",
              },
              {
                q: "Who is eligible to participate in the assessment?",
                a: "College students, job seekers, working professionals seeking career upskilling, and business owners looking to master growth marketing are all eligible.",
              },
              {
                q: "What anti-cheat rules are enforced during the test?",
                a: "The exam incorporates AI-monitored tab-switch detection on desktop and app-switch monitoring on mobile. Candidates receive 2 warnings, and on the 3rd strike violation, the test is automatically submitted.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 group transition-all open:border-red-200 open:shadow-xs cursor-pointer"
              >
                <summary className="text-sm sm:text-base font-bold text-slate-900 list-none flex items-center justify-between gap-3">
                  <span>{faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INSTITUTIONAL BACKLINK BRIDGE TO MAIN PORTAL */}
        {/* ========================================================================= */}
        <section className="max-w-4xl mx-auto pt-6 border-t border-slate-200 text-center space-y-4">
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            The Digital Marketing Scholarship Examination is conducted under the academic supervision of the{" "}
            <a
              href="https://idigitalstudies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EA2525] font-bold hover:underline"
            >
              Institute of Digital Studies (IDS)
            </a>
            , Noida Sector 62. Explore our{" "}
            <a
              href="https://idigitalstudies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EA2525] font-bold hover:underline"
            >
              Master Digital Marketing Courses & Agency Internship Programs
            </a>
            .
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-700" />
              <span>2,000+ Placed Students</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-700" />
              <span>50+ Corporate Hiring Partners</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
              <span>Noida Sector 62 Campus</span>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* POPUP MODAL: 2-STEP CANDIDATE REGISTRATION + WHATSAPP OTP VERIFICATION */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-slate-900 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 1: DEMOGRAPHICS FORM */}
            {modalStep === "form" ? (
              <div>
                {/* Modal Header */}
                <div className="mb-5 pr-8">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EA2525] uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                    <Sparkles className="w-3 h-3" />
                    <span>Up to 70% Scholarship</span>
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1.5">Candidate Registration</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your details. We will verify your WhatsApp number before initializing the test session.
                  </p>
                </div>

                {otpError && (
                  <div className="mb-3.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                    {otpError}
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition ${
                        errors.full_name
                          ? "border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-400"
                          : "border-slate-300 focus:border-[#EA2525] focus:ring-2 focus:ring-red-100"
                      }`}
                    />
                    {errors.full_name && <p className="text-[11px] text-red-600 mt-1">{errors.full_name}</p>}
                  </div>

                  {/* WhatsApp / Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp / Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-medium">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                        className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition ${
                          errors.phone
                            ? "border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-400"
                            : "border-slate-300 focus:border-[#EA2525] focus:ring-2 focus:ring-red-100"
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition ${
                        errors.email
                          ? "border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-400"
                          : "border-slate-300 focus:border-[#EA2525] focus:ring-2 focus:ring-red-100"
                      }`}
                    />
                    {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current City / State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Noida / Delhi / Lucknow"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white text-slate-900 focus:outline-none transition ${
                        errors.city
                          ? "border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-400"
                          : "border-slate-300 focus:border-[#EA2525] focus:ring-2 focus:ring-red-100"
                      }`}
                    />
                    {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                  </div>

                  {/* Profile */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Profile
                    </label>
                    <select
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#EA2525] focus:ring-2 focus:ring-red-100 transition bg-white text-slate-900"
                    >
                      <option value="College Student">College Student / Undergrad</option>
                      <option value="Recent Graduate">Recent Graduate (Job Seeker)</option>
                      <option value="Working Professional">Working Professional (Career Switch / Upskilling)</option>
                      <option value="Business Owner / Entrepreneur">Business Owner / Freelancer</option>
                    </select>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-black text-lg sm:text-xl py-4 px-6 rounded-2xl transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
                    >
                      {isOtpNeeded ? (
                        <>
                          <MessageSquare className="w-5 h-5 text-emerald-300" />
                          <span>{isSendingOtp ? "Sending WhatsApp OTP..." : "Get WhatsApp OTP →"}</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-5 h-5 text-amber-300" />
                          <span>Start Assessment ({TEST_DURATION_MINUTES} Mins) →</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {isOtpNeeded
                        ? "Official Meta WhatsApp Verification • Instant & Free"
                        : "Free Assessment • 20 MCQs • Instant Scorecard on Submit"}
                    </span>
                  </div>
                </form>
              </div>
            ) : (
              /* STEP 2: WHATSAPP OTP VERIFICATION SCREEN */
              <div className="space-y-4">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setModalStep("form");
                    setOtpError("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to details</span>
                </button>

                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <MessageSquare className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900">Verify WhatsApp Number</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    We sent a 6-digit verification code to your WhatsApp at{" "}
                    <strong className="text-slate-900 font-bold whitespace-nowrap">
                      +91 {formData.phone.replace(/\D/g, "").slice(-10)}
                    </strong>
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setModalStep("form");
                      setOtpError("");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#EA2525] hover:underline font-semibold"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change mobile number</span>
                  </button>
                </div>

                {/* OTP Verification Form */}
                <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                  {otpError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium text-center">
                      {otpError}
                    </div>
                  )}

                  {/* 6-Digit OTP Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      ref={otpInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtpValue(val);
                        if (otpError) setOtpError("");
                      }}
                      placeholder="• • • • • •"
                      className="w-full text-center text-3xl font-black tracking-[0.4em] sm:tracking-[0.5em] py-3.5 px-4 rounded-2xl border-2 border-slate-300 focus:border-[#EA2525] focus:ring-4 focus:ring-red-100 focus:outline-none transition font-mono bg-slate-50 text-slate-900"
                    />
                  </div>

                  {/* Resend Timer / Button */}
                  <div className="text-center text-xs text-slate-500">
                    {otpCooldown > 0 ? (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resend OTP in <strong>{otpCooldown}s</strong></span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={isSendingOtp}
                        className="inline-flex items-center gap-1.5 text-[#EA2525] font-bold hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                        <span>Didn&apos;t receive code? Resend OTP</span>
                      </button>
                    )}
                  </div>

                  {/* Verify & Start CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isVerifyingOtp || otpValue.length < 6}
                      className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-black text-lg py-4 px-6 rounded-2xl transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 animate-pulse-scale active:scale-[0.98]"
                    >
                      <span>{isVerifyingOtp ? "Verifying OTP..." : "Verify & Start Test (5 Mins) →"}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Verified Session • 3-Strike Tab Switch Proctoring</span>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/90 backdrop-blur-sm py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Institute of Digital Studies (IDS). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Noida Sector 62 Campus</span>
            <span>•</span>
            <span>Assessment Helpline: +91 98765 43210</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
