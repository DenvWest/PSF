 "use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Wordmark from "@/components/app/Wordmark";
import * as Icons from "@/components/app/icons";
import { Button, Card, DeltaBadge, SectionHeader, SlotGrid, Sparkline } from "@/components/app/primitives";
import { CHECK_LOG, CHECKS, DASHBOARD_SECTIONS, IDENTITY_FIELDS, PILLAR, PILLARS, SIGNALS } from "@/data/dashboard";
import { buildModel, derivePriority } from "@/lib/dashboard-model";
import type { CheckId, DashboardModel, DashboardSectionType, PillarId, Signal } from "@/types/dashboard";

type DashboardProps = {
  empty?: boolean;
  checkId?: "check1" | "check2";
  retest?: boolean;
};

type SharedSectionProps = {
  empty?: boolean;
  model: DashboardModel;
  retest?: boolean;
  onCheck: () => void;
};

type VitalityRingProps = {
  state?: "locked" | "scored";
  value?: number;
  delta?: number | null;
  size?: number;
  stroke?: number;
};

const VitalityRing = ({ state = "scored", value = 0, delta = null, size = 172, stroke = 13 }: VitalityRingProps) => {
  const locked = state === "locked";
  const [disp, setDisp] = useState(0);

  useEffect(() => {
    if (locked) {
      return;
    }
    let raf = 0;
    let start: number | undefined;
    const dur = 1150;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(e * value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const settle = window.setTimeout(() => setDisp(value), dur + 150);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [value, locked]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, disp)) / 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          {locked ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray="2 10"
            />
          ) : (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--sage)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct)}
              style={{ filter: "drop-shadow(0 0 6px rgba(90,143,106,0.4))" }}
            />
          )}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: size * 0.32, color: locked ? "var(--text-subtle)" : "var(--text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{locked ? "—" : Math.round(disp)}</div>
          <div style={{ fontSize: 12, color: "var(--text-subtle)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 6 }}>Vitaliteit</div>
        </div>
      </div>
      {locked ? (
        <div style={{ fontSize: 12.5, color: "var(--text-subtle)" }}>Nog geen score</div>
      ) : (
        delta != null && (
          <div style={{ fontSize: 12.5, fontWeight: 600, color: delta >= 0 ? "var(--sage)" : "var(--terra)", fontVariantNumeric: "tabular-nums" }}>
            {delta >= 0 ? "+" : ""}
            {delta} sinds je vorige check
          </div>
        )
      )}
    </div>
  );
};

const DashHeader = ({ onLogout }: { onLogout: () => void }) => {
  const iconBtn = {
    width: 38,
    height: 38,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--panel-border)",
    color: "var(--text-muted)",
    cursor: "pointer",
  } as const;

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
      <Wordmark />
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={iconBtn} title="Instellingen">
          <Icons.Settings s={18} />
        </button>
        <button type="button" style={iconBtn} title="Uitloggen" onClick={onLogout}>
          <Icons.LogOut s={18} />
        </button>
      </div>
    </header>
  );
};

const Greeting = ({ empty, model }: { empty?: boolean; model: DashboardModel }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontFamily: "var(--f-serif)", fontSize: 30, color: "var(--text)", lineHeight: 1.1 }}>
      {empty ? "Goed dat je er bent." : "Welkom terug."}
    </div>
    <div style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5, textWrap: "pretty" }}>
      {empty
        ? "Eén check en dit dashboard begint te onthouden hoe het met je gaat — en waar je begint."
        : `${model.check.date} · je vertrekpunt nu is ${model.priority.label.toLowerCase()}.`}
    </div>
  </div>
);

const NowSection = ({ empty, model, onCheck }: SharedSectionProps) => (
  <Card glow="#5A8F6A" pad={24} style={{ borderColor: "rgba(90,143,106,0.28)" }}>
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", flex: "1 1 168px", minWidth: 168 }}>
        <VitalityRing state={empty ? "locked" : "scored"} value={empty ? 0 : model.vitality} delta={empty ? null : model.vitalityDelta} />
      </div>
      <div style={{ flex: "2 1 240px", minWidth: 220 }}>
        {empty ? (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sage)", marginBottom: 12 }}>
              <Icons.Spark s={14} /> Begin hier
            </div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 21, color: "var(--text)", lineHeight: 1.2, marginBottom: 8 }}>Doe je eerste check.</div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 18px", textWrap: "pretty" }}>
              12 vragen, 3 minuten. Daarna weet je waar je staat — en bij welke pijler je begint.
            </p>
            <Button onClick={onCheck} iconRight={<Icons.ArrowRight s={18} />}>
              Doe je eerste check
            </Button>
          </>
        ) : (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: model.priority.color, marginBottom: 12, whiteSpace: "nowrap" }}>
              <Icons.Target s={14} /> Je grootste hefboom
            </div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, color: "var(--text)", lineHeight: 1.2, marginBottom: 8 }}>{model.priority.label}.</div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 18px", textWrap: "pretty" }}>{model.priority.lever}</p>
            <Button variant="secondary" onClick={onCheck} iconRight={<Icons.ArrowDown s={17} />}>
              Naar mijn plan
            </Button>
          </>
        )}
      </div>
    </div>
  </Card>
);

const LADDER_ROW_H = 60;
const PrioritySection = ({ model, retest }: SharedSectionProps) => {
  const { scores, ladder } = model;
  const prevLadder = retest && model.check.prevId ? derivePriority(CHECKS[model.check.prevId].scores) : null;
  const targetIdx = Object.fromEntries(ladder.map((p, i) => [p.id, i])) as Record<PillarId, number>;
  const startIdx = prevLadder
    ? (Object.fromEntries(prevLadder.map((p, i) => [p.id, i])) as Record<PillarId, number>)
    : targetIdx;
  const [pos, setPos] = useState(startIdx);

  useEffect(() => {
    // Alleen animeren bij een hertest; zonder hertest blijft pos de rustvolgorde (init = targetIdx).
    if (!prevLadder) {
      return;
    }
    const kick = window.setTimeout(() => setPos(startIdx), 0);
    const t = window.setTimeout(() => setPos(targetIdx), 550);
    const settle = window.setTimeout(() => setPos(targetIdx), 1650);
    return () => {
      window.clearTimeout(kick);
      window.clearTimeout(t);
      window.clearTimeout(settle);
    };
    // checkId is het enige signaal dat de ladder opnieuw moet animeren; de afgeleide
    // index-objecten zijn elke render nieuw en zouden de animatie in een lus trekken.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.checkId]);

  return (
    <section>
      <SectionHeader eyebrow="Prioriteit" title="Waar je nu begint" action={<span style={{ fontSize: 12, color: "var(--text-subtle)" }}>zwakste bovenaan</span>} />
      <Card pad={8}>
        <div style={{ position: "relative", height: ladder.length * LADDER_ROW_H }}>
          {ladder.slice(1).map((_, i) => (
            <div key={`d${i}`} style={{ position: "absolute", left: 12, right: 12, top: (i + 1) * LADDER_ROW_H, height: 1, background: "var(--divider)" }} />
          ))}
          {ladder.map((pillar) => {
            const Icon = Icons[pillar.icon];
            const score = scores[pillar.id];
            const idx = pos[pillar.id];
            const focus = idx === 0;
            return (
              <div
                key={pillar.id}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: LADDER_ROW_H,
                  transform: `translateY(${idx * LADDER_ROW_H}px)`,
                  transition: "transform .85s cubic-bezier(.4,0,.2,1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%", padding: "0 12px", borderRadius: 16, background: focus ? `${pillar.color}1f` : "transparent", transition: "background .5s" }}>
                  <div style={{ width: 24, fontFamily: "var(--f-serif)", fontSize: 16, color: focus ? pillar.color : "var(--text-subtle)", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{idx + 1}</div>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${pillar.color}1f`, color: pillar.color, border: `1px solid ${pillar.color}33` }}>
                    <Icon s={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14.5, color: "var(--text)", fontWeight: focus ? 600 : 500 }}>{pillar.label}</span>
                      {focus && <span style={{ fontSize: 11, color: pillar.color, fontWeight: 600, whiteSpace: "nowrap" }}>{"← hier begin je nu"}</span>}
                    </div>
                    <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginTop: 7 }}>
                      <div style={{ width: `${score}%`, height: "100%", background: pillar.color, opacity: focus ? 1 : 0.5, borderRadius: 3, transition: "opacity .5s" }} />
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--f-serif)", fontSize: 19, color: focus ? "var(--text)" : "var(--text-muted)", fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" }}>{score}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
};

const PlanSection = ({ model }: SharedSectionProps) => {
  const { lifestyle, supplement } = model;
  return (
    <section id="plan">
      <SectionHeader eyebrow="Je plan" title="Leefstijl eerst" />
      <Card pad={20} style={{ borderColor: "rgba(90,143,106,0.26)" }} glow="#5A8F6A">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(90,143,106,0.18)", color: "var(--sage)", border: "1px solid rgba(90,143,106,0.32)" }}>
            <Icons.Leaf s={17} />
          </span>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Spoor A · Leefstijl</div>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Hier zit je winst</span>
        </div>
        {lifestyle.map((item, i) => (
          <div key={item.pillar.id} style={{ display: "flex", gap: 13, padding: "14px 2px", borderTop: i ? "1px solid var(--divider)" : "none" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 2, border: "1.5px solid var(--divider-strong)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-subtle)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, color: "var(--text)", fontWeight: 600 }}>{item.win.title}</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: item.pillar.color, background: `${item.pillar.color}1f`, border: `1px solid ${item.pillar.color}33`, borderRadius: 999, padding: "2px 8px" }}>{item.pillar.label}</span>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 5, textWrap: "pretty" }}>{item.win.detail}</div>
            </div>
          </div>
        ))}
      </Card>
      {supplement && (
        <div style={{ marginTop: 10, paddingLeft: 14, borderLeft: "2px solid var(--divider)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 8px" }}>
            <Icons.Pill s={14} style={{ color: "var(--text-subtle)" }} />
            <span style={{ fontSize: 11.5, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Spoor B · Aanvulling, pas hierna</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--divider)", borderRadius: 16, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--f-serif)", fontSize: 18, color: "var(--text)" }}>{supplement.name}</span>
              <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 14, color: "var(--text-subtle)" }}>{supplement.form}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--divider)", borderRadius: 6, padding: "2px 7px" }}>Evidence {supplement.grade}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              <span style={{ color: "var(--terra)" }}>{supplement.signal}</span>{" → "}
              {supplement.claim}.
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 8, lineHeight: 1.5 }}>EFSA-toegestane bewoording. Een aanvulling op een gemeten gat — geen vervanging van het leefstijl-spoor.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, fontSize: 11.5, color: "var(--text-muted)" }}>
            <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
            <span>Onafhankelijk — wij verkopen niets zelf.</span>
          </div>
        </div>
      )}
    </section>
  );
};

const SignalsSection = ({ model }: SharedSectionProps) => {
  const [showUpcoming, setShowUpcoming] = useState(false);
  const connectedSignals = SIGNALS.filter((signal) => signal.status === "connected");
  const upcomingSignals = SIGNALS.filter((signal) => signal.status !== "connected");

  const renderSignal = (signal: Signal) => {
    const connected = signal.status === "connected";
    const last = connected ? signal.data[signal.data.length - 1] : null;
    return (
      <Card key={signal.id} pad={15} style={connected ? undefined : { borderStyle: "dashed", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: connected ? signal.color : "var(--text-subtle)", display: "flex" }}>
              <Icons.Activity s={16} />
            </span>
            <span style={{ fontSize: 13, color: connected ? "var(--text)" : "var(--text-muted)", fontWeight: 500 }}>{signal.label}</span>
          </div>
          {connected ? (
            <span style={{ fontSize: 10.5, color: signal.color, border: `1px solid ${signal.color}44`, background: `${signal.color}1a`, borderRadius: 999, padding: "2px 8px" }}>verbonden</span>
          ) : (
            <span style={{ fontSize: 10.5, color: "var(--text-subtle)", border: "1px solid var(--divider)", borderRadius: 999, padding: "2px 8px" }}>binnenkort</span>
          )}
        </div>
        <Sparkline data={connected ? signal.data : null} color={signal.color} empty={!connected} h={34} />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontFamily: "var(--f-serif)", fontSize: 18, color: connected ? "var(--text)" : "var(--text-subtle)", fontVariantNumeric: "tabular-nums" }}>
            {connected ? `${last}` : "—"}
            <span style={{ fontSize: 11, color: "var(--text-subtle)", marginLeft: 2 }}>{signal.unit}</span>
          </span>
        </div>
      </Card>
    );
  };

  return (
    <section>
      <SectionHeader eyebrow="Signalen & trend" title="Wat er beweegt" action={<span style={{ fontSize: 12, color: "var(--text-subtle)" }}>laatste 6 checks</span>} />
      <SlotGrid min={150} gap={10}>
        {PILLARS.map((pillar) => {
          const Icon = Icons[pillar.icon];
          return (
            <Card key={pillar.id} pad={15}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: pillar.color, display: "flex" }}>
                    <Icon s={16} />
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{pillar.label}</span>
                </div>
                <DeltaBadge delta={model.deltaOf(pillar.id)} />
              </div>
              <Sparkline data={model.check.trend[pillar.id]} color={pillar.color} />
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 10 }}>
                <span style={{ fontFamily: "var(--f-serif)", fontSize: 20, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{model.scores[pillar.id]}</span>
                <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>/ 100</span>
              </div>
            </Card>
          );
        })}
      </SlotGrid>
      <div style={{ fontSize: 11.5, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "18px 2px 10px" }}>Objectieve signalen</div>
      <SlotGrid min={150} gap={10}>
        {connectedSignals.map(renderSignal)}
        <button
          type="button"
          onClick={() => setShowUpcoming((v) => !v)}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 10, padding: 15, borderRadius: 24, cursor: "pointer", textAlign: "left", border: "1px dashed var(--panel-border)", background: "rgba(255,255,255,0.015)", color: "var(--text-muted)" }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 9, border: "1px solid var(--divider)", color: "var(--text-subtle)", transform: showUpcoming ? "rotate(45deg)" : "none", transition: "transform .25s" }}>
            <Icons.Plus s={16} />
          </span>
          <span style={{ fontSize: 12.5, lineHeight: 1.35 }}>
            {showUpcoming ? "Verberg komende signalen" : `${upcomingSignals.length} komende signalen`}
          </span>
        </button>
      </SlotGrid>
      {showUpcoming && (
        <div style={{ marginTop: 10 }}>
          <SlotGrid min={150} gap={10}>
            {upcomingSignals.map(renderSignal)}
          </SlotGrid>
        </div>
      )}
      <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 12, lineHeight: 1.5 }}>
        Je HRV stijgt licht en <span style={{ color: "var(--text-muted)" }}>bevestigt je herstel-trend uit de check-in</span> — een wearable diagnosticeert niet, het bevestigt richting.
      </div>
    </section>
  );
};

const RetestSection = ({ model, retest }: SharedSectionProps) => {
  if (!retest) {
    return (
      <Card pad={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--panel-border)", color: "var(--text-muted)" }}>
            <Icons.Refresh s={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}>Over 6 dagen: je voortgangscheck</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>Dan meten we of je hefboom werkte — en of je prioriteit verschuift.</div>
          </div>
        </div>
      </Card>
    );
  }

  const prev = CHECKS[model.check.prevId as CheckId];
  const prevPriority = derivePriority(prev.scores)[0];
  const rows = [...PILLARS]
    .map((pillar) => ({
      pillar,
      now: model.scores[pillar.id],
      was: prev.scores[pillar.id],
      d: model.scores[pillar.id] - prev.scores[pillar.id],
    }))
    .sort((a, b) => Math.abs(b.d) - Math.abs(a.d));

  return (
    <section>
      <Card pad={22} glow="#C8956C" style={{ borderColor: "rgba(200,149,108,0.26)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--terra)", marginBottom: 12 }}>
          <Icons.TrendUp s={14} /> Je hertest · {model.check.date}
        </div>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 21, color: "var(--text)", lineHeight: 1.25, marginBottom: 8 }}>
          Je prioriteit is verschoven van {prevPriority.label.toLowerCase()} naar {model.priority.label.toLowerCase()}.
        </div>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 16px", textWrap: "pretty" }}>
          Voeding werkte: <span style={{ color: "var(--sage)" }}>+14 in 30 dagen</span>. Maar je slaap zakte en is nu je vertrekpunt — daarom staat hierboven je plan én je aanvulling al anders.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((row, i) => (
            <div key={row.pillar.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 2px", borderTop: i ? "1px solid var(--divider)" : "none" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.pillar.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>{row.pillar.label}</span>
              <span style={{ fontSize: 13, color: "var(--text-subtle)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {row.was} → {row.now}
              </span>
              <span style={{ width: 34, textAlign: "right" }}>
                <DeltaBadge delta={row.d} />
              </span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

const IdentitySection = ({ empty }: SharedSectionProps) => {
  const fields = empty ? IDENTITY_FIELDS.map((field) => ({ ...field, value: null })) : IDENTITY_FIELDS;
  const filled = fields.filter((field) => field.value).length;
  return (
    <section>
      <Card glow="#C8956C" pad={22} style={{ borderColor: "rgba(200,149,108,0.26)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--terra)", marginBottom: 10 }}>
          <Icons.Spark s={14} /> Maak het persoonlijk
        </div>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 20, color: "var(--text)", lineHeight: 1.2 }}>Elk veld dat je invult, ontgrendelt iets.</div>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.55, margin: "8px 0 0", textWrap: "pretty" }}>
          Geen profiel om het profiel - geslacht, gewicht, lengte en werk berekenen je persoonlijke eiwitdoel en activiteitsniveau.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 16px" }}>
          <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            {filled > 0 && <div style={{ width: `${(filled / fields.length) * 100}%`, height: "100%", background: "var(--terra)", borderRadius: 4, transition: "width .6s" }} />}
          </div>
          <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
            {filled}/{fields.length} ingevuld
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {fields.map((field, i) => {
            const Icon = Icons[field.icon];
            const done = Boolean(field.value);
            return (
              <div key={field.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 2px", borderTop: i ? "1px solid var(--divider)" : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "rgba(90,143,106,0.16)" : "rgba(255,255,255,0.04)", border: `1px solid ${done ? "rgba(90,143,106,0.32)" : "var(--panel-border)"}`, color: done ? "var(--sage)" : "var(--text-subtle)" }}>
                  <Icon s={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{field.label}</span>
                    {done && (
                      <span style={{ width: 17, height: 17, borderRadius: "50%", background: "var(--sage)", color: "#0f1c10", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icons.Check s={11} sw={3} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: done ? "var(--sage)" : "var(--text-subtle)", marginTop: 3, lineHeight: 1.4, textWrap: "pretty" }}>{done ? field.outcome || field.unlocks : field.unlocks}</div>
                </div>
                {done ? (
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>{field.value}</span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--terra)", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                    <Icons.Plus s={15} /> Invullen
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <Button variant="terra" full iconRight={<Icons.ArrowRight s={18} />}>
            {filled === 0 ? "Vul je profiel aan" : "Maak het af"}
          </Button>
        </div>
      </Card>
    </section>
  );
};

const HistorySection = ({ empty, model }: SharedSectionProps) => {
  const [open, setOpen] = useState(false);
  if (empty) {
    return (
      <Card pad={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--panel-border)", color: "var(--text-subtle)" }}>
            <Icons.Clock s={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}>Je historie</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Elke check verschijnt hier — met je prioriteit van dat moment.</div>
          </div>
        </div>
      </Card>
    );
  }
  const past = CHECK_LOG.filter((entry) => entry.seq < model.check.seq).reverse();
  return (
    <section>
      <Card pad={0}>
        <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 13, padding: "18px 20px", cursor: "pointer" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--panel-border)", color: "var(--text-muted)" }}>
            <Icons.Clock s={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}>Eerdere checks</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{past.length} checks · je prioriteit schoof mee over tijd</div>
          </div>
          <span style={{ color: "var(--text-subtle)", display: "flex", transition: "transform .25s", transform: open ? "rotate(180deg)" : "none" }}>
            <Icons.ChevronDown s={20} />
          </span>
        </div>
        {open && (
          <div style={{ padding: "0 20px 10px" }}>
            {past.map((history, i) => {
              const priority = PILLAR[history.priority];
              return (
                <div key={`${history.seq}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderTop: "1px solid var(--divider)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "var(--text)" }}>{history.date}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, marginTop: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: priority.color }} />
                      <span style={{ color: "var(--text-muted)" }}>prioriteit: {priority.label.toLowerCase()}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--f-serif)", fontSize: 17, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{history.vitality}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
};

const FutureSection = () => (
  <section>
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 24, border: "1px dashed var(--panel-border)", background: "rgba(255,255,255,0.015)" }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", border: "1px solid var(--divider)", color: "var(--text-subtle)" }}>
        <Icons.Watch s={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, color: "var(--text-muted)", fontWeight: 500 }}>Koppel je wearable</div>
        <div style={{ fontSize: 12.5, color: "var(--text-subtle)", marginTop: 2 }}>Rustpols en slaapduur straks automatisch — het rooster groeit met je mee.</div>
      </div>
      <span style={{ fontSize: 11, color: "var(--text-subtle)", border: "1px solid var(--divider)", borderRadius: 999, padding: "4px 11px", whiteSpace: "nowrap" }}>Binnenkort</span>
    </div>
  </section>
);

const EMPTY_SECTIONS: DashboardSectionType[] = ["now", "identity", "history", "future"];

const SECTION_RENDERERS: Record<DashboardSectionType, (props: SharedSectionProps) => ReactElement | null> = {
  now: (props) => <NowSection {...props} />,
  priority: (props) => (props.empty ? null : <PrioritySection {...props} />),
  plan: (props) => (props.empty ? null : <PlanSection {...props} />),
  signals: (props) => (props.empty ? null : <SignalsSection {...props} />),
  retest: (props) => (props.empty ? null : <RetestSection {...props} />),
  identity: (props) => <IdentitySection {...props} />,
  history: (props) => <HistorySection {...props} />,
  future: () => <FutureSection />,
};

export default function Dashboard({ empty, checkId = "check1", retest = false }: DashboardProps) {
  const router = useRouter();
  const model = useMemo(() => (empty ? buildModel("check1") : buildModel(checkId)), [empty, checkId]);
  const sections = empty ? DASHBOARD_SECTIONS.filter((section) => EMPTY_SECTIONS.includes(section.type)) : DASHBOARD_SECTIONS;
  const onCheck = () => {
    if (empty) {
      router.push("/intake");
      return;
    }

    const target = document.getElementById("plan");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const onLogout = () => {
    // TODO F1.2: eerst cookie wissen via /api/account/logout.
    router.push("/account/login");
  };

  return (
    <div>
      <main style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "clamp(20px, 4vh, 36px) 18px 64px" }}>
        <DashHeader onLogout={onLogout} />
        <Greeting empty={empty} model={model} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              {SECTION_RENDERERS[section.type]({ empty, model, retest, onCheck })}
            </section>
          ))}
        </div>
        <footer style={{ marginTop: 28, textAlign: "center", fontSize: 11.5, color: "var(--text-subtle)", lineHeight: 1.6 }}>
          PerfectSupplement geeft adviezen op basis van leefstijl, geen medische diagnoses.
          <br />
          Je gegevens zijn van jou — exporteer of verwijder ze wanneer je wilt.
        </footer>
      </main>
    </div>
  );
}
