"use client";

type CookieConsentToggleProps = {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
  variant?: "locked" | "editable";
};

function trackClass(
  checked: boolean,
  variant: "locked" | "editable",
): string {
  if (variant === "locked" && checked) {
    return "bg-sky-200";
  }
  if (checked) {
    return variant === "editable" ? "bg-sky-600" : "bg-sky-200";
  }
  return "bg-stone-800";
}

export default function CookieConsentToggle({
  checked,
  disabled,
  onChange,
  label,
  variant = "editable",
}: CookieConsentToggleProps) {
  const isLocked = variant === "locked";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${trackClass(checked, variant)} ${
        isLocked ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
