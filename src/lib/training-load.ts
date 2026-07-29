/**
 * Trainingsbelasting (1–4) afgeleid uit intake-antwoorden — max van kracht/cardio.
 * Gedeeld tussen de eiwit-doelroute (server-afgeleid, client niet vertrouwd) en
 * de dashboard-personalisatie (zelfde afleiding, geen dubbele logica).
 */
export function deriveTrainingLoadFromAnswers(
  answers: Record<string, number>,
): number | undefined {
  const movStr = Number.isFinite(answers.MOV_STR) ? answers.MOV_STR : 0;
  const movCard = Number.isFinite(answers.MOV_CARD) ? answers.MOV_CARD : 0;
  const load = Math.max(movStr, movCard);
  return load >= 1 ? Math.min(4, load) : undefined;
}
