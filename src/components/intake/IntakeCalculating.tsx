"use client";

export default function IntakeCalculating() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-10 text-center">
      <div
        className="mb-7 h-14 w-14 animate-spin rounded-full border-[3px] border-[#eee] border-t-[#1a1a1a]"
        aria-hidden
      />
      <h2
        className="mb-2 text-[22px] font-normal text-[#1a1a1a]"
        style={{ fontFamily: "var(--font-intake-heading), Georgia, serif" }}
      >
        Je profiel wordt berekend...
      </h2>
      <p className="text-sm text-[#999]">Scores, signalen en advies op maat</p>
    </div>
  );
}
