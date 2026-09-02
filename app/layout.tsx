import type { Metadata } from "next";
import "./globals.css";
import AntiInspectGuard from "@/components/AntiInspectGuard";

export const metadata: Metadata = {
  title: "Digital Marketing Scholarship Test - DMST | iDigital Studies",
  description:
    "Take the official 5-minute Digital Marketing Scholarship Test (DMST) by Institute of Digital Studies (IDS). Qualify for up to 70% merit scholarship on advanced digital marketing master programs.",
  keywords: [
    "digital marketing scholarship",
    "IDS scholarship test",
    "digital marketing assessment",
    "institute of digital studies scholarship",
    "digital marketing test Noida Delhi",
  ],
  icons: {
    icon: "/IDS_LOGO.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col select-none">
        <AntiInspectGuard />
        {children}
      </body>
    </html>
  );
}
