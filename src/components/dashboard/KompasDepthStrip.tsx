"use client";

type KompasDepthStripProps = {
  onKompas: () => void;
  onDomain: () => void;
  domainLabel: string;
  depthLabel: string;
};

export default function KompasDepthStrip({
  onKompas,
  onDomain,
  domainLabel,
  depthLabel,
}: KompasDepthStripProps) {
  return (
    <nav
      aria-label="Diepte-navigatie"
      className="rounded-[20px] border border-white/10 bg-white/[0.045] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-md"
    >
      <ol className="flex flex-wrap items-center gap-1 text-[10.5px] font-semibold leading-none tracking-[0.01em]">
        <li>
          <button
            type="button"
            onClick={onKompas}
            className="cursor-pointer border-none bg-transparent p-0 text-stone-300 hover:text-stone-100"
          >
            Kompas
          </button>
        </li>
        <li aria-hidden className="text-stone-500">
          ·
        </li>
        <li>
          <button
            type="button"
            onClick={onDomain}
            className="cursor-pointer border-none bg-transparent p-0 text-stone-300 hover:text-stone-100"
          >
            {domainLabel}
          </button>
        </li>
        <li aria-hidden className="text-stone-500">
          ·
        </li>
        <li className="text-stone-400">{depthLabel}</li>
      </ol>
    </nav>
  );
}
