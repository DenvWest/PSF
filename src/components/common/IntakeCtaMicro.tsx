import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";

type IntakeCtaMicroProps = {
  className?: string;
};

export function IntakeCtaMicro({ className = "text-sm text-stone-500" }: IntakeCtaMicroProps) {
  return <p className={className}>{DISCLAIMER_TEXTS.ctaMicro}</p>;
}
