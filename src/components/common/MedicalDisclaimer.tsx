import Link from "next/link";

function InfoShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0 text-stone-400"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function MedicalDisclaimer() {
  return (
    <div className="border-t border-stone-200 py-6" role="complementary">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 md:flex-row md:items-center md:gap-4 lg:px-8">
        <InfoShieldIcon />
        <div className="min-w-0 text-sm text-stone-400">
          <p>
            De informatie op deze pagina is geen medisch advies. Raadpleeg bij
            klachten altijd een arts.
          </p>
          <p className="mt-2">
            <Link
              href="/medische-disclaimer"
              className="font-medium text-stone-400 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-500"
            >
              Lees onze volledige disclaimer →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
