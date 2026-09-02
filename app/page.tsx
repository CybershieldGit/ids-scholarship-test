"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

export default function RegistrationPage() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<StudentLead>({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    qualification: "College Student",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestionsCount = SCHOLARSHIP_QUESTIONS.length;

  // Auto-open modal after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Save student details in sessionStorage
    const studentLeadData: StudentLead = {
      full_name: formData.full_name.trim(),
      phone: formData.phone.replace(/\D/g, "").slice(-10),
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

    router.push("/test");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <AssessmentNavbar />

      {/* Hero Section (Clean White / Light Theme with Balanced Desktop Typography) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8 lg:space-y-10">
        {/* Top Authority Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-50 text-[#EA2525] px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-red-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Examination Authority • 2026 Session</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Digital Marketing Scholarship Test <br className="hidden sm:inline" />
            <span className="text-[#EA2525]">DMST</span>
          </h1>

          <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Standardized online aptitude assessment for admission into advanced master programs. Score eligible marks to qualify for <strong>Up to 70% Merit Scholarship</strong>.
          </p>

          {/* Primary CTA Button to trigger Modal with Continuous Breathing Animation */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 bg-[#EA2525] hover:bg-red-700 text-white font-extrabold text-lg lg:text-lg py-4 px-7 lg:py-3.5 lg:px-7 rounded-2xl transition-all duration-200 shadow-xl shadow-red-500/30 cursor-pointer group animate-pulse-scale active:scale-[0.98]"
            >
              <Flame className="w-5 h-5 text-amber-300" />
              <span>Start Test ({TEST_DURATION_MINUTES} Mins)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 4 Assessment Agency Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
            <Clock className="w-5 h-5 text-[#EA2525] mx-auto mb-1.5" />
            <p className="text-xl lg:text-xl font-extrabold text-slate-900">{TEST_DURATION_MINUTES} Minutes</p>
            <p className="text-xs text-slate-500 mt-0.5">Strict Timed Test</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
            <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
            <p className="text-xl lg:text-xl font-extrabold text-slate-900">{totalQuestionsCount} Questions</p>
            <p className="text-xs text-slate-500 mt-0.5">Multiple Choice (MCQ)</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
            <Award className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
            <p className="text-xl lg:text-xl font-extrabold text-slate-900">Up to 70%</p>
            <p className="text-xs text-slate-500 mt-0.5">Scholarship Tier</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
            <ShieldAlert className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-xl lg:text-xl font-extrabold text-slate-900">AI Proctored</p>
            <p className="text-xs text-slate-500 mt-0.5">3-Strike Anti-Cheat</p>
          </div>
        </div>

        {/* Examination Security & Guidelines Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Security & Anti-Cheat Protocols */}
          <div className="bg-white border border-red-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5">
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

        {/* Institutional Credentials Footnote */}
        <div className="max-w-4xl mx-auto pt-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
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
      </main>

      {/* ========================================================================= */}
      {/* POPUP MODAL: STUDENT REGISTRATION (AUTO-OPENS IN 2S OR ON BUTTON CLICK) */}
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

            {/* Modal Header */}
            <div className="mb-5 pr-8">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EA2525] uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                <Sparkles className="w-3 h-3" />
                <span>Up to 70% Scholarship</span>
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1.5">Candidate Registration</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your details to initialize your proctored 5-minute assessment session.
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleStartTest} className="space-y-3.5">
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

              {/* Current Background */}
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
                  disabled={isSubmitting}
                  className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-black text-lg sm:text-xl py-4 px-6 rounded-2xl transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Initializing Session..." : "Start Test →"}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Encrypted proctoring session • 3-strike tab switch policy applies</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
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
