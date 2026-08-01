import * as Icons from "@/components/app/icons";

export default function DomainSoonPill({ label = "Binnenkort" }: { label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#C8956C]/40 px-[11px] py-1 text-[11px] font-bold tracking-[0.04em] text-[#C8956C]">
      <Icons.Spark s={12} /> {label}
    </span>
  );
}
