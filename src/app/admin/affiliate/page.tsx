"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminAffiliatePayload } from "@/app/api/admin/affiliate/route";
import type { CountRow } from "@/lib/affiliate-analytics";

function formatNlDay(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}

function horizontalBarHeight(rowCount: number): number {
  return Math.min(400, 40 + Math.max(3, rowCount) * 28);
}

function CountBarChart({
  title,
  rows,
  yAxisWidth = 140,
}: {
  title: string;
  rows: CountRow[];
  yAxisWidth?: number;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[#1a1a1a]">{title}</h3>
      <div className="w-full" style={{ height: horizontalBarHeight(rows.length) }}>
        {rows.length === 0 ? (
          <p className="text-sm text-[#999]">Nog geen data.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={rows}
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="key"
                width={yAxisWidth}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#1a1a1a"
                radius={[0, 4, 4, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function AdminAffiliatePage() {
  const [data, setData] = useState<AdminAffiliatePayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/affiliate", {
          credentials: "same-origin",
        });
        if (!res.ok) {
          if (!cancelled) {
            setLoadError("Kon affiliate-data niet laden.");
          }
          return;
        }
        const json = (await res.json()) as AdminAffiliatePayload;
        if (!cancelled) {
          setData(json);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Kon affiliate-data niet laden.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const trendChartData =
    data?.clickTrend.map((row) => ({
      ...row,
      label: formatNlDay(row.date),
    })) ?? [];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8F7F4" }}>
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label="Menu sluiten"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ borderColor: "#e8e6e1" }}
      >
        <div className="border-b px-5 py-6" style={{ borderColor: "#e8e6e1" }}>
          <p
            className="text-base font-semibold text-[#1a1a1a]"
            style={{ fontFamily: "var(--font-dm-serif), serif" }}
          >
            PerfectSupplement
          </p>
          <p className="mt-1 text-xs text-[#999]">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm">
          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            className="mb-1 rounded-lg border border-[#5A8F6A]/30 bg-[#e8f5ee] px-3 py-2 font-medium text-[#4A7F5A] hover:bg-[#d8ede0]"
          >
            ← PartnerDesk
          </Link>
          <Link
            href="/admin/site"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-[#1a1a1a] hover:bg-[#F8F7F4]"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/site#sessions"
            scroll
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-[#1a1a1a] hover:bg-[#F8F7F4]"
          >
            Sessies
          </Link>
          <Link
            href="/admin/site#feedback"
            scroll
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-[#1a1a1a] hover:bg-[#F8F7F4]"
          >
            Feedback
          </Link>
          <Link
            href="/admin/site#nurture"
            scroll
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-[#1a1a1a] hover:bg-[#F8F7F4]"
          >
            Nurture-mail
          </Link>
          <Link
            href="/admin/affiliate"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg bg-[#F8F7F4] px-3 py-2 font-medium text-[#1a1a1a]"
          >
            Affiliate
          </Link>
        </nav>
        <div className="border-t p-4" style={{ borderColor: "#e8e6e1" }}>
          <a
            href="/api/admin/auth"
            className="block w-full rounded-lg border border-[#e8e6e1] py-2 text-center text-sm font-medium text-[#1a1a1a] hover:bg-[#F8F7F4]"
          >
            Uitloggen
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between gap-4 border-b bg-white px-4 py-3 md:hidden"
          style={{ borderColor: "#e8e6e1" }}
        >
          <button
            type="button"
            className="rounded-lg border border-[#e8e6e1] px-3 py-2 text-sm font-medium text-[#1a1a1a]"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
          >
            Menu
          </button>
          <a
            href="/api/admin/auth"
            className="text-sm font-medium text-[#1a1a1a] underline"
          >
            Uitloggen
          </a>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1
                className="text-3xl font-semibold text-[#1a1a1a] md:text-4xl"
                style={{ fontFamily: "var(--font-dm-serif), serif" }}
              >
                Affiliate
              </h1>
              <p className="mt-2 text-sm text-[#999]">
                Clicks en intake-acquisitie per bron
              </p>
            </div>
            <a
              href="/api/admin/auth"
              className="hidden text-sm font-medium text-[#1a1a1a] underline md:inline"
            >
              Uitloggen
            </a>
          </div>

          {loadError ? (
            <p className="text-red-600" role="alert">
              {loadError}
            </p>
          ) : null}

          {!data && !loadError ? (
            <p className="text-[#999]">Laden…</p>
          ) : null}

          {data ? (
            <div className="flex flex-col gap-8">
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <p className="text-[13px] text-[#999]">Totaal clicks</p>
                  <p className="mt-2 text-[32px] font-bold leading-none text-[#1a1a1a]">
                    {data.totalClicks}
                  </p>
                  <p className="mt-2 text-[13px] text-[#999]">
                    Gefilterd op standaard-organisatie
                  </p>
                </div>
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <p className="text-[13px] text-[#999]">Clicks (30 dagen)</p>
                  <p className="mt-2 text-[32px] font-bold leading-none text-[#1a1a1a]">
                    {data.totalClicks30d}
                  </p>
                  <p className="mt-2 text-[13px] text-[#999]">
                    Laatste 30 kalenderdagen
                  </p>
                </div>
              </section>

              <section
                className="rounded-xl border bg-white p-6"
                style={{ borderColor: "#e8e6e1" }}
              >
                <h2 className="mb-6 text-lg font-semibold text-[#1a1a1a]">
                  Clicks per pagina, sub-ID en categorie
                </h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  <CountBarChart
                    title="Clicks per pagina"
                    rows={data.clicksPerPage}
                    yAxisWidth={160}
                  />
                  <CountBarChart
                    title="Clicks per sub-ID"
                    rows={data.clicksPerSubId}
                    yAxisWidth={160}
                  />
                  <CountBarChart
                    title="Clicks per categorie"
                    rows={data.clicksPerCategory}
                  />
                </div>
              </section>

              <section
                className="rounded-xl border bg-white p-6"
                style={{ borderColor: "#e8e6e1" }}
              >
                <h2 className="mb-2 text-lg font-semibold text-[#1a1a1a]">
                  Click-trend (30 dagen)
                </h2>
                <p className="mb-6 text-sm text-[#999]">
                  Aantal affiliate-clicks per dag
                </p>
                <div className="h-[280px] w-full">
                  {trendChartData.length === 0 ? (
                    <p className="text-sm text-[#999]">Nog geen data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trendChartData}
                        margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                      >
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          allowDecimals={false}
                          width={32}
                        />
                        <Tooltip
                          labelFormatter={(_, payload) => {
                            const row = payload?.[0]?.payload as
                              | { date?: string }
                              | undefined;
                            return row?.date ? formatNlDay(row.date) : "";
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#1a1a1a"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </section>

              <section
                className="rounded-xl border bg-white p-6"
                style={{ borderColor: "#e8e6e1" }}
              >
                <h2 className="text-lg font-semibold text-[#1a1a1a]">
                  Intake-acquisitie per bron
                </h2>
                <p className="mt-2 text-sm text-[#999]">
                  Niet click-attributed — gebaseerd op referral_source bij
                  intake-start
                </p>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[360px] text-left text-sm">
                    <thead>
                      <tr
                        className="border-b text-[13px] text-[#999]"
                        style={{ borderColor: "#e8e6e1" }}
                      >
                        <th className="pb-3 pr-4 font-medium">Bron</th>
                        <th className="pb-3 font-medium">Aantal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.intakeByReferralSource.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-4 text-[#999]">
                            Nog geen intake-sessies met bron.
                          </td>
                        </tr>
                      ) : (
                        data.intakeByReferralSource.map((row) => (
                          <tr
                            key={row.key}
                            className="border-b last:border-b-0"
                            style={{ borderColor: "#e8e6e1" }}
                          >
                            <td className="py-3 pr-4 text-[#1a1a1a]">
                              {row.key}
                            </td>
                            <td className="py-3 text-[#555]">{row.count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
