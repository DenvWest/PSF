import Link from "next/link";
import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";

function InfoShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

type MedicalDisclaimerProps = {
  variant?: "default" | "intake";
  theme?: "light" | "dark";
};

export function MedicalDisclaimer({
  variant = "default",
  theme = "light",
}: MedicalDisclaimerProps) {
  const text =
    variant === "intake" ? DISCLAIMER_TEXTS.intake : DISCLAIMER_TEXTS.default;

  if (theme === "dark") {
    return (
      <div
        className="mt-6 max-w-md text-xs text-center"
        role="complementary"
        style={{ color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}
      >
        <p>{text}</p>
        {variant === "intake" ? (
          <p className="mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Meer:{" "}
            <Link
              href="/privacy"
              style={{
                color: "rgba(255,255,255,0.5)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              privacyverklaring
            </Link>
            {" · "}
            <Link
              href="/medische-disclaimer"
              style={{
                color: "rgba(255,255,255,0.5)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              medische disclaimer
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="border-t border-stone-200 py-8" role="complementary">
      <div className="bg-stone-50/50 -mx-6 px-6 lg:-mx-8 lg:px-8 py-6 rounded-lg">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
          <InfoShieldIcon className="h-5 w-5 shrink-0 text-stone-400" />
          <div className="min-w-0 text-sm text-stone-400">
            <p>{text}</p>
            {variant === "intake" ? (
              <p className="mt-2">
                Meer:{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-stone-400 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-600"
                >
                  privacyverklaring
                </Link>
                {" · "}
                <Link
                  href="/medische-disclaimer"
                  className="font-medium text-stone-400 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-600"
                >
                  medische disclaimer
                </Link>
              </p>
            ) : (
              <p className="mt-2">
                <Link
                  href="/medische-disclaimer"
                  className="font-medium text-stone-400 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-600"
                >
                  Lees onze volledige medische disclaimer →
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
