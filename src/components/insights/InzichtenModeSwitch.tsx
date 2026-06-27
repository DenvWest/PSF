import Link from "next/link";

type InzichtenModeSwitchProps = {
  active: "aanpak" | "artikelen";
};

export default function InzichtenModeSwitch({ active }: InzichtenModeSwitchProps) {
  const base = "rounded-full px-5 py-2 text-sm font-semibold transition";
  return (
    <div className="inline-flex gap-1 rounded-full bg-[#EEEAE4] p-[3px]">
      <Link
        href="/inzichten?weergave=aanpak"
        className={`${base} ${active === "aanpak" ? "bg-[#0E1A14] text-[#F7F5F0]" : "text-stone-500 hover:text-stone-700"}`}
      >
        Aanpak
      </Link>
      <Link
        href="/inzichten"
        className={`${base} ${active === "artikelen" ? "bg-[#0E1A14] text-[#F7F5F0]" : "text-stone-500 hover:text-stone-700"}`}
      >
        Artikelen
      </Link>
    </div>
  );
}
