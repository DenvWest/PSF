import Link from "next/link";

const LINKS = [
  {
    href: "/beste/omega-3-supplement",
    title: "Omega 3 vergelijken",
    subtitle: "EPA, DHA en prijs per dag",
  },
  {
    href: "/beste/magnesium",
    title: "Magnesium vergelijken",
    subtitle: "Bisglycinaat, citraat en malaat",
  },
  {
    href: "/thema/slaap",
    title: "Slaapsupplementen",
    subtitle: "Melatonine, magnesium en kruiden",
  },
] as const;

export default function BlogVergelijkingLinks() {
  return (
    <div className="max-w-3xl">
      <p className="text-sm text-stone-500">
        Wanneer je verder wilt: onafhankelijke productanalyses op basis van wat je
        hier hebt gelezen.
      </p>
      <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-stone-600 underline decoration-stone-300/80 underline-offset-4 transition hover:text-stone-900"
            >
              {link.title}
            </Link>
            <span className="hidden text-stone-400 sm:inline"> — {link.subtitle}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
