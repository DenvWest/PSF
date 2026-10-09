import { HOW_IT_WORKS_QUESTIONS } from "@/data/how-it-works";

type HowItWorksQuestionsProps = {
  size?: "sm" | "md";
  showWhere?: boolean;
  className?: string;
};

export default function HowItWorksQuestions({
  size = "md",
  showWhere = true,
  className = "",
}: HowItWorksQuestionsProps) {
  const small = size === "sm";

  return (
    <ol className={`m-0 grid list-none p-0 ${small ? "gap-2.5" : "gap-4"} ${className}`}>
      {HOW_IT_WORKS_QUESTIONS.map((item, index) => (
        <li key={item.id} className="flex gap-2.5">
          <span
            aria-hidden
            className={`flex shrink-0 items-center justify-center rounded-full border border-current/25 font-semibold tabular-nums opacity-80 ${
              small ? "mt-px h-[18px] w-[18px] text-[10.5px]" : "h-6 w-6 text-xs"
            }`}
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <p
              className={`m-0 font-semibold leading-snug text-pretty ${
                small ? "text-[12.5px]" : "text-[15px]"
              }`}
            >
              {item.question}
            </p>
            {small ? null : (
              <p className="m-0 mt-1 text-sm leading-relaxed opacity-75 text-pretty">
                {item.answer}
              </p>
            )}
            {showWhere ? (
              <p
                className={`m-0 mt-0.5 uppercase tracking-[0.1em] opacity-55 ${
                  small ? "text-[9.5px]" : "text-[10.5px]"
                }`}
              >
                {item.where}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
