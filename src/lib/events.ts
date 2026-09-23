import { getDefaultOrganizationId } from "@/lib/organization";
import {
  markDomainEventDelivered,
  publishDomainEventToN8n,
} from "@/lib/n8n-webhook";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const DOMAIN_EVENT_TYPES = [
  "account.created",
  "account.logged_in",
  "account.login_email_failed",
  "dashboard.first_checkin_started",
  "dashboard.vitality_scored",
  "dashboard.cta_to_hub",
  "dashboard.cta.clicked",
  "dashboard.aanrader_clicked",
  "dashboard.daily_action_toggled",
  "dashboard.priority_selected",
  "dashboard.domain_check_cta_clicked",
  "dashboard.time_bucket_set",
  "dashboard.movement_day_choice_set",
  "agenda.block_created",
  "agenda.block_toggled",
  "agenda.block_updated",
  "agenda.block_deleted",
  "agenda.block_restored",
  "agenda.plan_step_dismissed",
  "agenda.plan_step_restored",
  "domain_tool.snapshot_viewed",
  "domain_tool.tier_preview_clicked",
  "intake.completed",
  "intake.started",
  "intake.phase_completed",
  "intake.theme_revealed",
  "intake.cta_to_pillar",
  "intake.cta_to_nutrition_log",
  "intake.cta_to_primary_checkin",
  "intake.cta_to_comparison",
  "intake.track_chosen",
  "focus.viewed",
  "plan.viewed",
  "plan.action_clicked",
  "plan.tier_action_clicked",
  "plan.evidence_clicked",
  "plan.theme_switched",
  "plan.step_state_changed",
  "plan.phase_completed",
  "plan.step_link_clicked",
  "plan.phase_expanded",
  "plan.phase_opened",
  "plan.daily_rhythm_clicked",
  "plan.week_category_selected",
  "movement.session_logged",
  "movement.target_set",
  "movement.location_selected",
  "movement.sport_selected",
  "movement.gap_shown",
  "dashboard.beweging_programma_open",
  "choice.shelf_opened",
  "wearable.interest_clicked",
  "plan.checkin_completed",
  "premium.waitlist_joined",
  "premium.price_indicated",
  "email.opted_in",
  "consent.revoked",
  "consent.analytics_set",
  "evidence.chat_queried",
  "nurture.email_sent",
  "nurture.scheduled",
  "nurture.skipped",
  "remeasure.invited",
  "remeasure.completed",
  "verdict.changed",
  "dashboard.schap_vergelijking_click",
  "dashboard.schap_getoond",
  "dashboard.schap_tab_selected",
  "dashboard.advies_gate_passed",
  "dashboard.afleiding_opened",
  "affiliate.click",
  // A2 — noemer onder de affiliate-klik. Zonder weergaves per vergelijkingspagina
  // is "0 klikken" niet te onderscheiden van "0 bezoekers". Payload bevat alleen
  // productkennis: slug + categorie.
  "comparison.page_viewed",
  "profile.recognition",
  "measurement.gap_detected",
  "measurement.checkin_completed",
  "measurement.direction_detected",
  "measurement.protein_target_computed",
  "measurement.protein_cta_clicked",
  "guide.sleep_analysis.started",
  "guide.sleep_analysis.completed",
  "goal.benchmark_set",
  "goal.benchmark_rescored",
  "nutrition.basis_category_viewed",
  "nutrition.basis_category_expanded",
  "nutrition.roadmap_step_opened",
  "nutrition.sufficiency_viewed",
  "nutrition.tijdlaag_viewed",
  "nutrition.kompas_priorities_viewed",
  "nutrition.kompas_priority_clicked",
  "nutrition.reflectie_shown",
  "nutrition.reflectie_answered",
  "sleep.reflectie_shown",
  "sleep.reflectie_answered",
  "nutrition.dagboek_opened",
  "nutrition.dagboek_day_saved",
  "nutrition.dagboek_completed",
  "nutrition.dagboek_kalibratie_shown",
  // Plak C — de balk-naar-detail-naar-zoek-naar-portie-flow. `nutrient_opened`
  // zegt welke stof mensen aanklikken (voedt straks de urgentie-volgorde in
  // plak E); `zoek_item_gekozen` of ze eerder gebruikt of nieuw zoeken, en of
  // dat een voedingsmiddel of een supplement is; `portie_bevestigd` sluit de
  // flow — pas dán staat het item echt in het dagboek.
  "nutrition.dagboek_nutrient_opened",
  "nutrition.dagboek_zoek_item_gekozen",
  "nutrition.dagboek_portie_bevestigd",
  // De ster-knop: bewaart een voedingsmiddel/supplement in "Mijn producten"/
  // "Mijn supplementen", los van de automatische geschiedenis. `bron` zegt
  // welk tabblad het raakt.
  "nutrition.dagboek_favoriet_toegevoegd",
  "nutrition.dagboek_favoriet_verwijderd",
  // Je patroon (plak 4): het tekortsysteem als scherm. `nutrient` is de stof
  // waar de bevinding op wijst, en dat is de dimensie die zegt welke
  // vergelijkingspagina dit scherm zou moeten voeden. Geen vrije tekst, geen
  // dagboekinhoud — alleen de stof, de telling en de richting.
  "nutrition.tekortsysteem_viewed",
  // De uitgang van het dashboard naar de monetisatie. Dit was tot plak 4 het
  // ontbrekende event: 33.373 regels dashboard met nul kliks naar /beste/*.
  // Gegroepeerd op `nutrient` zegt het welke vergelijkingspagina het dashboard
  // voedt; `covered` of mensen ook doorklikken als hun dekking al bewezen is.
  "nutrition.week_nutrient_clicked",
  // De premium nutriëntentabel bovenaan Samenvatting: welke stoffen mensen
  // uitzetten. `zichtbaar` is de nieuwe staat na de klik, zodat een query op
  // `nutrient` groeperen laat zien welke stof het vaakst verborgen wordt.
  "nutrition.patroon_nutrient_toggle",
  // Het schap (S1): van nutriënt naar producten. Deze drie beantwoorden of de
  // omgekeerde index gebruikt wordt, welke producten mensen overwegen, en of de
  // categoriefilter er toe doet. `schap_bron_clicked` gegroepeerd op `key` is de
  // lijst die zegt welke catalogusregels als volgende een gehalte verdienen.
  // Alleen productkennis in de payload — nutriënt, sleutel, categorie, aantal.
  "nutrition.schap_bronnen_getoond",
  "nutrition.schap_bron_clicked",
  "nutrition.schap_categorie_gefilterd",
  // Contentlaag — brengt een artikel iemand verder of loopt het dood? Dit was
  // tot nu toe onmeetbaar: alle ~110 events zaten ín de app (dashboard, intake,
  // plan), en op de 151 contentpagina's stond alleen affiliate.click. `stepKind`
  // is de dimensie, zodat artikel→check, artikel→stof en artikel→vergelijking
  // één query blijven in plaats van drie event-typen.
  "content.next_step_shown",
  "content.next_step_clicked",
  "content.related_clicked",
  // Connection Profile — zelf opgegeven voorkeuren, GEEN gezondheidsdata.
  // De ratio cprofile.completed / cprofile.step_completed{step:1} is de meting
  // die toetst of stap 2 te confronterend is (BESLUIT §12).
  "cprofile.step_completed",
  "cprofile.completed",
  "cprofile.highlight_clicked",
] as const;

export type DomainEventType = (typeof DOMAIN_EVENT_TYPES)[number];

const EVENT_TYPE_SET = new Set<string>(DOMAIN_EVENT_TYPES);

export function isDomainEventType(value: string): value is DomainEventType {
  return EVENT_TYPE_SET.has(value);
}

export type EmitEventInput = {
  eventType: DomainEventType;
  sessionId?: string | null;
  email?: string | null;
  payload?: Record<string, unknown>;
  organizationId?: string;
  deliveredTo?: string[];
};

export async function emitEvent(input: EmitEventInput): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    console.error("[emitEvent] Supabase admin not configured", {
      eventType: input.eventType,
    });
    return;
  }

  const organizationId = input.organizationId ?? getDefaultOrganizationId();
  const email =
    typeof input.email === "string" && input.email.trim()
      ? input.email.trim().toLowerCase()
      : null;

  const deliveredTo = input.deliveredTo ?? [];

  const { data: inserted, error } = await admin
    .from("domain_events")
    .insert({
      organization_id: organizationId,
      event_type: input.eventType,
      session_id: input.sessionId ?? null,
      email,
      payload: input.payload ?? {},
      delivered_to: deliveredTo,
    })
    .select(
      "id, organization_id, occurred_at, event_type, session_id, email, payload",
    )
    .single();

  if (error) {
    console.error("[emitEvent] insert failed:", {
      eventType: input.eventType,
      message: error.message,
    });
    return;
  }

  if (
    inserted &&
    deliveredTo.includes("n8n_webhook")
  ) {
    const payload =
      inserted.payload &&
      typeof inserted.payload === "object" &&
      !Array.isArray(inserted.payload)
        ? (inserted.payload as Record<string, unknown>)
        : {};

    void publishDomainEventToN8n({
      id: inserted.id,
      organization_id: inserted.organization_id,
      occurred_at: inserted.occurred_at,
      event_type: inserted.event_type,
      session_id: inserted.session_id,
      email: inserted.email,
      payload,
    }).then((ok) => {
      if (ok) {
        void markDomainEventDelivered(inserted.id, "n8n_webhook");
      }
    });
  }
}
