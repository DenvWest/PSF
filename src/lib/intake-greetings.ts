const HAS_LETTER = /[a-zA-ZÀ-ÿ]/;

export function isUsableFirstName(value: string | null | undefined): boolean {
  if (!value) return false;
  return HAS_LETTER.test(value);
}

export function getHeroTitle(firstName: string | null | undefined): string {
  if (isUsableFirstName(firstName)) {
    const name = firstName!.trim();
    return `Jouw leefstijloverzicht, ${name}`;
  }
  return "Jouw leefstijloverzicht";
}

export function getMailConfirmation(firstName: string | null | undefined): string {
  if (isUsableFirstName(firstName)) {
    const name = firstName!.trim();
    return `${name}, je ontvangt je leefstijl-overzicht ook per mail.`;
  }
  return "Je ontvangt je leefstijl-overzicht ook per mail.";
}
