import Link from "next/link";
import { redirect } from "next/navigation";
import VoedingsdoelenKaart from "@/components/account/VoedingsdoelenKaart";
import { getAccountFromCookie } from "@/lib/account-server";

export const metadata = {
  title: "Doelen",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Je doelen: een eigen scherm, geen vijfde tab.
 *
 * De vier tabs vormen één lus (Dagboek meet, Je patroon weegt, Keuze dicht,
 * Mijn Dag plant). Wat hier staat is de meetlat waar alle vier tegen aflezen
 * — dat hoort ernaast, bereikbaar via "Meer", en niet als vijfde stap in een
 * lus waar het niet in zit.
 *
 * Eigen header en geen cockpit-chrome: dit is een zijpad waar je vandaan
 * terugkeert, niet een plek waar je blijft. De terugweg staat daarom bovenaan
 * en niet alleen in de browserknop.
 */
export default async function DoelenPage() {
  const account = await getAccountFromCookie();
  if (!account) {
    redirect("/account/login");
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-6">
      <header className="mb-6 grid gap-2">
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] text-[var(--text-muted)] no-underline transition hover:text-[var(--text)]"
        >
          ← Terug naar je dashboard
        </Link>
        <h1 className="m-0 font-serif text-[26px] leading-tight text-[var(--text)]">
          Je doelen
        </h1>
        <p className="m-0 text-[14px] leading-relaxed text-[var(--text-muted)]">
          Waar je dagboek, je patroon en je keuzes tegen afgelezen worden. Wat je
          hier niet invult, komt uit je laatste check.
        </p>
      </header>

      <VoedingsdoelenKaart />
    </main>
  );
}
