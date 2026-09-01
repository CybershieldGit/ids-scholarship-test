"use client";

import { useState } from "react";
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
  Building,
  Users,
  BookOpen,
} from "lucide-react";

export default function RegistrationPage() {
  const router = useRouter();

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
      // Clear any prior test state
      sessionStorage.removeItem("ids_test_answers");
      sessionStorage.removeItem("ids_test_result");
      sessionStorage.setItem("ids_test_start_time", Date.now().toString());
    }

    router.push("/test");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <AssessmentNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Scholarship Hook & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 bg-red-100 text-[#EA2525] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border border-red-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official 2026 Scholarship Assessment</span>
            </div>

            {/* Main Heading */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                National Digital Marketing <span className="text-[#EA2525]">Scholarship Test</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
                Take the official {TEST_DURATION_MINUTES}-minute aptitude assessment by <strong>Institute of Digital Studies (IDS)</strong>. Qualify for <strong>Up to 100% Scholarship</strong> on master programs with 100% placement support.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                <Clock className="w-5 h-5 text-[#EA2525] mx-auto mb-1.5" />
                <p className="text-sm font-bold text-slate-900">{TEST_DURATION_MINUTES} Mins</p>
                <p className="text-[11px] text-slate-500">Timed Test</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                <p className="text-sm font-bold text-slate-900">{totalQuestionsCount} Questions</p>
                <p className="text-[11px] text-slate-500">Multiple Choice</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                <Award className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                <p className="text-sm font-bold text-slate-900">Up to 100%</p>
                <p className="text-[11px] text-slate-500">Scholarship Tier</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-sm font-bold text-slate-900">No Penalty</p>
                <p className="text-[11px] text-slate-500">Zero Negative Marks</p>
              </div>
            </div>

            {/* Test Rules / Instructions Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Important Test Instructions</span>
              </h2>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#EA2525] font-bold">•</span>
                  <span><strong>{totalQuestionsCount} Multiple Choice Questions:</strong> Covers SEO, Social Media, Google Ads, Email Marketing, Analytics & Funnels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EA2525] font-bold">•</span>
                  <span><strong>Countdown Timer:</strong> You will have {TEST_DURATION_MINUTES} minutes to complete the test. Timer starts when you click Start.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EA2525] font-bold">•</span>
                  <span><strong>Confidential Evaluation:</strong> Results are evaluated by the Academic Committee. Our senior counselor will contact you with your scholarship grant letter.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EA2525] font-bold">•</span>
                  <span><strong>Do Not Refresh:</strong> Please maintain an active internet connection while taking the assessment.</span>
                </li>
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-700" />
                <span>2,000+ Students Placed</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-700" />
                <span>50+ Hiring Partners</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-700" />
                <span>Noida Sector 62 Campus</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Registration Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 sticky top-24">
              <div className="mb-6">
                <span className="text-xs font-bold text-[#EA2525] uppercase tracking-wider">Step 1 of 2</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Student Registration</h2>
                <p className="text-xs text-slate-500 mt-1">Enter your details to generate your official test session.</p>
              </div>

              <form onSubmit={handleStartTest} className="space-y-4">
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
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
                    Mobile / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-medium">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                      className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                      errors.city
                        ? "border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-400"
                        : "border-slate-300 focus:border-[#EA2525] focus:ring-2 focus:ring-red-100"
                    }`}
                  />
                  {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                </div>

                {/* Qualification / Background */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Background
                  </label>
                  <select
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#EA2525] focus:ring-2 focus:ring-red-100 transition bg-white"
                  >
                    <option value="College Student">College Student / Undergrad</option>
                    <option value="Recent Graduate">Recent Graduate (Looking for Job)</option>
                    <option value="Working Professional">Working Professional (Career Switch / Upskilling)</option>
                    <option value="Business Owner / Entrepreneur">Business Owner / Freelancer</option>
                  </select>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#EA2525] hover:bg-red-700 text-white font-bold text-base py-3.5 px-6 rounded-xl transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Generating Session..." : "Start Scholarship Test"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <p className="text-[11px] text-center text-slate-400 pt-1">
                  🔒 By proceeding, you agree to receive your scholarship scorecard & counseling from IDS.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Institute of Digital Studies (IDS). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Noida Sector 62 Campus</span>
            <span>•</span>
            <span>Helpline: +91 98765 43210</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
