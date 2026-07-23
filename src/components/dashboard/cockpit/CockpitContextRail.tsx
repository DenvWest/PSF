"use client";

import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import type {
  ContextRailDomainItem,
  ContextRailMode,
  ContextRailTool,
  ContextRailToolId,
} from "@/lib/context-rail";
import type { PillarId } from "@/types/dashboard";

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

type CockpitContextRailProps = {
  mode: ContextRailMode;
  firstName?: string | null;
  anchorLabel?: string | null;
  statusDone: boolean;
  onCheckin?: () => void;
  domains?: ContextRailDomainItem[];
  activeDomain?: PillarId | null;
  onOpenDomain?: (id: PillarId) => void;
  tools?: ContextRailTool[];
  onToolClick?: (id: ContextRailToolId) => void;
  onBackToKompas?: () => void;
  domainLabel?: string | null;
};

const ZONEFLAG =
  "text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7E8C82]";

const RAIL_ITEM =
  "flex w-full items-center gap-2.5 rounded-[12px] border px-2.5 py-2 text-left text-[13.5px] font-medium transition";

function iconOf(name: string): IconComp | null {
  return (Icons[name as keyof typeof Icons] as IconComp | undefined) ?? null;
}

function StatusDot({ statusDone }: { statusDone: boolean }) {
  return (
    <span
      aria-label={statusDone ? "Gedaan" : "Nog te doen"}
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
        statusDone
          ? "border-[#5A8F6A] bg-[#5A8F6A] text-[#0f1c10]"
          : "border-[#7E8C82] text-transparent"
      }`}
    >
      {statusDone ? <Icons.Check s={11} /> : null}
    </span>
  );
}

function ProfileFooter({
  name,
  anchorLabel,
  statusDone,
}: {
  name: string;
  anchorLabel?: string | null;
  statusDone: boolean;
}) {
  return (
    <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 pt-3.5">
      <span
        aria-hidden
        className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#C8956C] to-[#9c6a44]"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-serif text-[15px] leading-tight text-[#F1EFE8]">
          {name}
        </div>
        {anchorLabel ? (
          <div className="truncate text-[11.5px] text-[#9FB0A6]">
            voor: {anchorLabel}
          </div>
        ) : null}
      </div>
      <StatusDot statusDone={statusDone} />
    </div>
  );
}

/**
 * Contextuele linker rail: dezelfde kolom toont profiel, je domeinen of de
 * tools van het open domein — afhankelijk van waar je staat. Alleen desktop;
 * onder md blijft de compacte profielstrip staan en navigeer je via de
 * DomainTopNav in de header.
 */
export default function CockpitContextRail({
  mode,
  firstName,
  anchorLabel,
  statusDone,
  onCheckin,
  domains = [],
  activeDomain = null,
  onOpenDomain,
  tools = [],
  onToolClick,
  onBackToKompas,
  domainLabel,
}: CockpitContextRailProps) {
  const name = firstName?.trim() || "Je profiel";

  const renderTool = (tool: ContextRailTool) => {
    const Icon = iconOf(tool.icon);
    const iconNode = Icon ? (
      <Icon
        s={16}
        style={{ color: tool.active ? "#5A8F6A" : "rgba(159,176,166,0.85)" }}
      />
    ) : null;

    if (tool.disabled) {
      return (
        <span
          key={tool.id}
          title={tool.disabledHint}
          aria-disabled
          className={`${RAIL_ITEM} cursor-not-allowed border-transparent text-[#7E8C82]`}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center opacity-60">
            {iconNode}
          </span>
          <span className="min-w-0 flex-1 truncate">{tool.label}</span>
          <Icons.Lock s={13} style={{ color: "#7E8C82", flexShrink: 0 }} />
        </span>
      );
    }

    const className = `${RAIL_ITEM} no-underline ${
      tool.active
        ? "border-[#5A8F6A]/45 bg-[#5A8F6A]/12 text-[#F1EFE8]"
        : "border-transparent text-[#9FB0A6] hover:border-white/10 hover:bg-white/[0.05] hover:text-[#F1EFE8]"
    }`;

    const body = (
      <>
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {iconNode}
        </span>
        <span className="min-w-0 flex-1 truncate">{tool.label}</span>
      </>
    );

    if (tool.href) {
      return (
        <Link
          key={tool.id}
          href={tool.href}
          onClick={() => onToolClick?.(tool.id)}
          className={`${className} text-inherit`}
        >
          {body}
        </Link>
      );
    }

    return (
      <button
        key={tool.id}
        type="button"
        aria-current={tool.active ? "page" : undefined}
        onClick={() => onToolClick?.(tool.id)}
        className={className}
      >
        {body}
      </button>
    );
  };

  const renderDomain = (domain: ContextRailDomainItem) => {
    const Icon = iconOf(domain.icon);
    const active = domain.id === activeDomain;

    return (
      <button
        key={domain.id}
        type="button"
        aria-current={active ? "page" : undefined}
        onClick={() => onOpenDomain?.(domain.id)}
        className={`${RAIL_ITEM} ${
          active
            ? "border-[#5A8F6A]/45 bg-[#5A8F6A]/12 text-[#F1EFE8]"
            : "border-transparent text-[#9FB0A6] hover:border-white/10 hover:bg-white/[0.05] hover:text-[#F1EFE8]"
        }`}
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {Icon ? <Icon s={16} style={{ color: domain.color }} /> : null}
        </span>
        <span className="min-w-0 flex-1 truncate">{domain.label}</span>
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[#7E8C82]">
          {domain.score}
        </span>
      </button>
    );
  };

  return (
    <>
      <aside
        aria-label="Profiel"
        className="flex items-center gap-2.5 border-b border-white/10 px-4 py-2.5 md:hidden"
      >
        <span
          aria-hidden
          className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#C8956C] to-[#9c6a44]"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-[15px] leading-tight text-[#F1EFE8]">
            {name}
          </div>
          {anchorLabel ? (
            <div className="truncate text-[11px] text-[#9FB0A6]">
              voor: {anchorLabel}
            </div>
          ) : null}
        </div>
        <StatusDot statusDone={statusDone} />
        {onCheckin ? (
          <button
            type="button"
            onClick={onCheckin}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-[#9FB0A6] transition hover:border-white/20 hover:text-[#F1EFE8]"
          >
            Check-in
          </button>
        ) : null}
      </aside>

      <aside
        aria-label={
          mode === "kompasHome"
            ? "Je domeinen"
            : mode === "domainTools"
              ? `${domainLabel ?? "Domein"}-navigatie`
              : "Profiel"
        }
        className="hidden flex-col gap-4 border-b border-white/10 p-4 md:flex md:border-b-0 md:border-r"
      >
        {mode === "kompasHome" ? (
          <>
            <span className={ZONEFLAG}>Je domeinen</span>
            <nav aria-label="Je domeinen" className="flex flex-col gap-1">
              {domains.map(renderDomain)}
            </nav>
            <ProfileFooter
              name={name}
              anchorLabel={anchorLabel}
              statusDone={statusDone}
            />
          </>
        ) : mode === "domainTools" ? (
          <>
            {onBackToKompas ? (
              <button
                type="button"
                onClick={onBackToKompas}
                className="group flex items-center gap-2 self-start rounded-full border border-[#5A8F6A]/35 bg-gradient-to-r from-[#5A8F6A]/20 to-[#5A8F6A]/[0.06] px-3.5 py-2 text-[13px] font-bold text-[#F1EFE8] shadow-[0_1px_0_rgba(255,255,255,0.05)] transition hover:border-[#5A8F6A]/60 hover:from-[#5A8F6A]/28"
              >
                <Icons.Compass
                  s={16}
                  sw={2}
                  style={{ color: "#6FB07E" }}
                />
                <span>Kompas</span>
              </button>
            ) : null}
            <span className={ZONEFLAG}>{domainLabel ?? "Domein"}</span>
            <nav
              aria-label={`${domainLabel ?? "Domein"}-tools`}
              className="flex flex-col gap-1"
            >
              {tools.map((tool) => (
                <div key={tool.id}>
                  {tool.id === "gids" ? (
                    <div className="my-1.5 border-t border-white/10" aria-hidden />
                  ) : null}
                  {renderTool(tool)}
                </div>
              ))}
            </nav>
            <ProfileFooter
              name={name}
              anchorLabel={anchorLabel}
              statusDone={statusDone}
            />
          </>
        ) : (
          <>
            <span className={ZONEFLAG}>Wie ben ik</span>

            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#C8956C] to-[#9c6a44]"
              />
              <div className="min-w-0">
                <div className="font-serif text-[17px] leading-tight text-[#F1EFE8]">
                  {name}
                </div>
                {anchorLabel ? (
                  <div className="truncate text-[11.5px] text-[#9FB0A6]">
                    voor: {anchorLabel}
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#7E8C82]">
                  Vandaag
                </span>
                <StatusDot statusDone={statusDone} />
              </div>
              <p className="mt-2 text-[12px] leading-snug text-[#9FB0A6]">
                {statusDone
                  ? "Gedaan — je stap van vandaag is afgevinkt."
                  : "Je dagstap staat klaar — nog niet afgevinkt."}
              </p>
            </div>

            {onCheckin ? (
              <button
                type="button"
                onClick={onCheckin}
                className="rounded-[14px] border border-dashed border-white/10 p-3 text-left transition hover:border-white/20"
              >
                <span className="text-[13.5px] font-medium text-[#F1EFE8]">
                  Hoe voel je je vandaag?
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[12px] text-[#9FB0A6]">
                  Korte check-in <Icons.ArrowRight s={13} />
                </span>
              </button>
            ) : null}
          </>
        )}
      </aside>
    </>
  );
}
