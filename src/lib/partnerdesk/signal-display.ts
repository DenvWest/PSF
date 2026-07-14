// Weergave van signalen (label + deep-link-anker). Puur; gedeeld client/server.

export function signalLabel(
  type: string,
  payload: Record<string, unknown>,
): string {
  switch (type) {
    case "contract_expiring":
      return `Contract verloopt over ${payload.days_left ?? "?"} dgn`;
    case "cancel_deadline":
      return "Opzegdeadline nadert";
    case "partner_no_contact":
      return "Geen contactpersoon";
    case "missing_commission":
      return "Actief contract zonder commissieregel";
    case "stale_contact":
      return "Al >90 dgn geen contact";
    case "task_overdue":
      return `Taak te laat: ${payload.title ?? ""}`;
    default:
      return type;
  }
}

/** Anker in het dossier waar dit signaal wordt opgelost. */
export function signalAnchor(type: string): string {
  switch (type) {
    case "contract_expiring":
    case "cancel_deadline":
      return "contracten";
    case "missing_commission":
      return "commissies";
    case "partner_no_contact":
      return "contactpersonen";
    case "stale_contact":
      return "tijdlijn";
    case "task_overdue":
      return "taken";
    default:
      return "algemeen";
  }
}
