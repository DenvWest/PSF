import { HOMEPAGE_HERO } from "@/data/homepage";
import {
  CATEGORIES,
  QUESTIONS,
  type Category,
  type IntakeQuestion,
  type QuestionId,
} from "@/data/intake-questions";

function getCategory(categoryId: Category["id"]): Category {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }
  return category;
}

function getPreviewQuestions(ids: readonly QuestionId[]): IntakeQuestion[] {
  return ids.map((id) => {
    const question = QUESTIONS.find((q) => q.id === id);
    if (!question) {
      throw new Error(`Unknown question: ${id}`);
    }
    return question;
  });
}

/**
 * Het product in beeld: de check zelf, niet een foto van potjes. Puur
 * decoratief, dus volledig `aria-hidden` — de echte vragen staan op /intake.
 */
export default function HeroCheckPreview() {
  const { progressLabel, progressPercent, questionIds } = HOMEPAGE_HERO.preview;
  const previewQuestions = getPreviewQuestions(questionIds);

  return (
    <div className="w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-ps-green"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-stone-500">
          {progressLabel}
        </span>
      </div>

      <ul className="space-y-2.5 sm:space-y-3">
        {previewQuestions.map((q, index) => {
          const category = getCategory(q.category);
          return (
            <li
              key={q.id}
              /* De derde kaart valt weg op mobiel, anders duwt het beeld de knop onder de vouw. */
              className={`list-none rounded-xl border border-stone-200/80 bg-white p-3.5 shadow-sm sm:p-4 ${
                index === 2 ? "hidden sm:block" : ""
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm">{category.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {category.label}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug text-stone-800">
                {q.question}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
