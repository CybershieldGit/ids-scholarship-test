"use client";

interface ForensicWatermarkProps {
  studentName: string;
  studentPhone: string;
}

export default function ForensicWatermark({
  studentName,
  studentPhone,
}: ForensicWatermarkProps) {
  const watermarkText = `${studentName} • +91 ${studentPhone} • IDS Assessment`;
  const rows = Array.from({ length: 8 });
  const cols = Array.from({ length: 4 });

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none opacity-[0.05] sm:opacity-[0.06] flex flex-col justify-around rotate-[-22deg] scale-125"
    >
      {rows.map((_, rIdx) => (
        <div
          key={rIdx}
          className="flex justify-around items-center whitespace-nowrap text-[11px] sm:text-xs font-mono font-bold tracking-widest text-slate-900"
        >
          {cols.map((_, cIdx) => (
            <span key={cIdx} className="px-6 py-2">
              {watermarkText}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
