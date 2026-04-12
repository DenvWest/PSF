/** Versie van de getoonde toestemmingsteksten (audittrail). */
export const CONSENT_VERSION = "1.0" as const;

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
    "Ik wil e-mailupdates ontvangen over mijn herstelplan",
};

/** Teksten contactformulier (NL); zelfde consent_type-waarden als intake. */
export const CONTACT_CONSENT_TEXT: Record<ConsentType, string> = {
  health_data_processing:
    "Ik geef toestemming voor de verwerking van de gegevens in dit bericht, inclusief eventuele gezondheidsgegevens, voor het beantwoorden van mijn vraag",
  anonymous_analytics:
    "Ik sta anonieme analyse van mijn bericht toe voor productverbetering",
  marketing_email:
    "Ik wil e-mailupdates ontvangen over mijn herstelplan",
};
