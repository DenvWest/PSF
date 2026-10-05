import Link from "next/link";
import { redirect } from "next/navigation";
import VoedingOverzicht from "@/components/dashboard/voeding/VoedingOverzicht";
import { getAccountFromCookie } from "@/lib/account-server";

export const metadata = {
  title: "Voeding",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Voedingsstoffen en macro's: een eigen scherm via "Meer", net als Je doelen.
 * Het dagboek is om in te vullen; hier lees je per dag of week af wat het
 * opleverde. Eigen header, geen cockpit-chrome: een zijpad met de terugweg
 * bovenaan.
 */
export default async function VoedingPage() {
  const account = await getAccountFromCookie();
  if (!account) {
    redirect("/account/login");
  }

  return (
    <div className="ps-dark">
      <main className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-6">
        <header className="mb-6 grid gap-2">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-1.5 text-[13px] text-[var(--text-muted)] no-underline transition hover:text-[var(--text)]"
          >
            ← Terug naar je dashboard
          </Link>
          <h1 className="m-0 font-serif text-[26px] leading-tight text-[var(--text)]">
            Voeding
          </h1>
          <p className="m-0 text-[14px] leading-relaxed text-[var(--text-muted)]">
            Wat je dagboek opleverde, per dag of per week. Informatie zonder
            oordeel — je doelen stel je zelf in bij Doelen.
          </p>
        </header>

        <VoedingOverzicht />
      </main>
    </div>
  );
}
