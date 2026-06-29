"use client";

import type { RevealModel } from "@/lib/reveal-model";

type RevealQuickWinProps = {
  model: RevealModel;
  variant?: "default" | "path";
};

export default function RevealQuickWin({ model, variant = "default" }: RevealQuickWinProps) {
  const className =
    variant === "path" ? "reveal-path-quickwin reveal-path-quickwin--featured" : "reveal-story-quickwin";

  return (
    <p className={className}>
      <span className="reveal-path-quickwin__label">Deze week</span>
      {model.priority.quickWin.title}
      <span className="reveal-path-quickwin__detail">{model.priority.quickWin.detail}</span>
    </p>
  );
}
