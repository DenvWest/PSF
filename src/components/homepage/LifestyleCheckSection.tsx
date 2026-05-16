import Link from "next/link";
import Container from "@/components/layout/Container";
import { HOMEPAGE_LIFESTYLE } from "@/data/homepage";
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

function IntakeCta({ className }: { className?: string }) {
  return (
    <Link
      href="/intake"
      className={
        className ??
        "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50 focus-visible:ring-offset-2"
      }
    >
      {HOMEPAGE_LIFESTYLE.cta}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

function QuestionPreviewStack() {
  const {
    previewQuestionIds,
    progressLabel,
    progressPercent,
  } = HOMEPAGE_LIFESTYLE;
  const previewQuestions = getPreviewQuestions(previewQuestionIds);

  return (
    <div className="w-full max-w-md lg:max-w-none">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-ps-green transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-stone-500" aria-hidden="true">
          {progressLabel}
        </span>
      </div>

      <ul className="space-y-3" aria-hidden="true">
        {previewQuestions.map((q) => {
          const category = getCategory(q.category);
          return (
            <li
              key={q.id}
              className="list-none rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm" aria-hidden>
                  {category.icon}
                </span>
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

export default function LifestyleCheckSection() {
  const {
    sectionId,
    title,
    subtitle,
    footnote,
  } = HOMEPAGE_LIFESTYLE;

  return (
    <section
      id={sectionId}
      className="scroll-mt-24 py-16 lg:py-20"
      style={{ background: "#FDFCFA" }}
      aria-label="Leefstijlcheck"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="font-serif text-2xl leading-tight text-stone-900 lg:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
              {subtitle}
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <li key={category.id} className="list-none">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700">
                    <span aria-hidden>{category.icon}</span>
                    {category.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden lg:block">
              <IntakeCta />
              <p className="mt-3 text-xs text-stone-500">{footnote}</p>
            </div>
          </div>

          <QuestionPreviewStack />

          <div className="lg:hidden">
            <IntakeCta className="inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover" />
            <p className="mt-3 text-center text-xs text-stone-500">{footnote}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
