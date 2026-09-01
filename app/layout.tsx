import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDS National Digital Marketing Scholarship Test 2026 | iDigital Studies",
  description:
    "Take the official 15-minute digital marketing scholarship test by Institute of Digital Studies (IDS). Qualify for up to 100% scholarship on advanced digital marketing master programs.",
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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
