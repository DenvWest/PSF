import { CHECK_CTA } from "@/lib/check-facts";

type IntakeCtaMicroProps = {
  className?: string;
};

export function IntakeCtaMicro({ className = "text-sm text-stone-500" }: IntakeCtaMicroProps) {
  return <p className={className}>{CHECK_CTA.micro}</p>;
}
