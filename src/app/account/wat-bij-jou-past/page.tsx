import { redirect } from "next/navigation";
import ConnectionProfileScreen from "@/components/connection-profile/ConnectionProfileScreen";
import { getAccountFromCookie } from "@/lib/account-server";
import { resolveProfileContent } from "@/lib/connection-content";
import { hasActiveConnectionProfileConsent } from "@/lib/connection-profile-consent";
import {
  isProfileUsable,
  resolveProfileHighlights,
} from "@/lib/connection-profile/highlights";
import { loadConnectionProfile } from "@/lib/connection-profile/store";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * "Wat bij jou past" — het enige adres van het profiel, uit
 * BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §10. Bewust geen eigen dashboard-tab
 * en bewust niet "Mijn Verbinding" of "Mijn Profiel" genoemd: die namen binden
 * het profiel aan het gezondheidsdomein of aan accountinstellingen, en dat is
 * precies de koppeling die §7 verbiedt.
 *
 * Wie hier al iets invulde landt op de uitkomst, niet op een formulier;
 * `?bewerken=1` slaat die uitkomst over voor wie vanaf het dashboard komt om
 * iets bij te werken.
 */

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ bewerken?: string }>;
};

export default async function ConnectionProfilePage({ searchParams }: PageProps) {
  const account = await getAccountFromCookie();
  if (!account) {
    redirect("/account/login");
  }

  const admin = createSupabaseAdmin();
  const consentGranted = admin
    ? await hasActiveConnectionProfileConsent(admin, account.id)
    : false;
  const profile = consentGranted ? await loadConnectionProfile(account.id) : null;

  // Server-side opgelost: de inzichten-catalogus hoort niet in de client-bundle,
  // en het scherm mag zijn opbrengst niet pas na een tweede ronde tonen.
  const content =
    profile && isProfileUsable(profile)
      ? resolveProfileContent(resolveProfileHighlights(profile).contentPillars)
      : [];

  const { bewerken } = await searchParams;

  return (
    <ConnectionProfileScreen
      initialProfile={profile}
      initialContent={content}
      consentGranted={consentGranted}
      startInEdit={bewerken === "1"}
    />
  );
}
