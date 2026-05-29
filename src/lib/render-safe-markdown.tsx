import type { ReactNode } from "react";

export function sanitizeMarkdownText(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

function renderBoldSegments(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={`${keyPrefix}-b-${index}`}>{part}</strong>
    ) : (
      part
    ),
  );
}

export function renderSafeMarkdown(text: string): ReactNode {
  const sanitized = sanitizeMarkdownText(text);
  if (!sanitized) {
    return null;
  }

  const paragraphs = sanitized.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  if (paragraphs.length <= 1) {
    return (
      <p className="m-0 text-[15px] leading-relaxed text-intake-ink-muted">
        {renderBoldSegments(paragraphs[0] ?? sanitized, "p0")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p
          key={`md-p-${index}`}
          className="m-0 text-[15px] leading-relaxed text-intake-ink-muted"
        >
          {renderBoldSegments(paragraph, `p${index}`)}
        </p>
      ))}
    </div>
  );
}
