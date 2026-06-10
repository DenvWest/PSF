/** Versie van de getoonde toestemmingsteksten (audittrail). */
export const CONSENT_VERSION = "2.1" as const;

export type ConsentType =
  | "health_data_processing"
  | "anonymous_analytics"
  | "marketing_email";

/** Teksten exact zoals op het intake-scherm (NL). */
export const INTAKE_CONSENT_TEXT: Record<ConsentType, string> = {
  health_data_processing:
    "Ik geef toestemming voor de verwerking van mijn gezondheidsgegevens voor persoonlijk supplementadvies",
  anonymous_analytics:
    "Ik sta anonieme analyse van mijn antwoorden toe voor productverbetering",
  marketing_email:
    "Ik wil mijn leefstijl-overzicht en korte vervolgstappen per e-mail ontvangen, afgestemd op mijn antwoorden over slaap, stress, energie, voeding en beweging. Ik begrijp dat hiervoor mijn gezondheidsgegevens worden gebruikt en kan dit intrekken via de uitschrijflink in elke mail.",
};

/** Teksten contactformulier (NL); zelfde consent_type-waarden als intake. */
export type GuideConsentType = "guide_marketing_email";

/** Tekst exact zoals op het gids-opt-in scherm (NL). */
export const GUIDE_CONSENT_TEXT: Record<GuideConsentType, string> = {
  guide_marketing_email:
    "Ik wil de gratis gids en relevante tips per e-mail ontvangen. Ik begrijp dat ik dit altijd kan intrekken.",
};

export type NutritionLogConsentType = "nutrition_intake_logging";

export const NUTRITION_LOG_CONSENT_TEXT: Record<NutritionLogConsentType, string> = {
  nutrition_intake_logging:
    "Ik geef toestemming om mijn periodieke voedingsrapportage te verwerken voor een persoonlijke inname-inschatting en leefstijladvies. Dit is geen medisch advies en geen diagnose; ik kan mijn toestemming altijd intrekken.",
};

export const CONTACT_CONSENT_TEXT: Record<ConsentType, string> = {
  health_data_processing:
    "Ik geef toestemming voor de verwerking van de gegevens in dit bericht, inclusief eventuele gezondheidsgegevens, voor het beantwoorden van mijn vraag",
  anonymous_analytics:
    "Ik sta anonieme analyse van mijn bericht toe voor productverbetering",
  marketing_email:
    "Ik wil e-mailupdates ontvangen over mijn herstelplan",
};
