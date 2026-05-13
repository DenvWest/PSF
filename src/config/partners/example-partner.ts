import type { OrgConfig } from "@/config/org";

export const EXAMPLE_PARTNER: OrgConfig = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Example Partner",
  slug: "example-partner",
  theme: {
    name: "example-partner",
    fonts: {
      primary:
        'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: 'Georgia, "Times New Roman", serif',
    },
    colors: {
      bg: "#f9fafb",
      surface: "#ffffff",
      border: "#e5e7eb",
      ink: "#111827",
      body: "#6b7280",
      muted: "#9ca3af",
      subtle: "#d1d5db",
      green: "#059669",
      greenHover: "#047857",
      greenLight: "#d1fae5",
      amber: "#d97706",
      amberLight: "#fef3c7",
    },
  },
  scoring: {
    sleepMax: 7,
    energyMax: 8,
    stressMax: 8,
    nutritionMax: 11,
    movementMax: 7,
    recoveryMax: 6,
  },
  supplements: ["magnesium", "omega-3-supplement", "vitamine-d"],
  affiliatePrefix: "partner-example",
  emailFromName: "Example Partner Wellness",
  emailFromAddress: "noreply@example-partner.nl",
};
