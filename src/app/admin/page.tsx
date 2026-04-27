"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminDashboardPayload } from "@/lib/admin-dashboard-types";

const PROFILE_FILL = [
  "#5B6EAE",
  "#C4873B",
  "#8B6E99",
  "#5A8F6A",
  "#C26E4B",
  "#4A8A99",
  "#7a6a5a",
  "#4a5568",
  "#b83280",
  "#276749",
];

function formatNlDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNlDay(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ratingLabel(rating: string): string {
  if (rating === "positive") return "Positief";
  if (rating === "negative") return "Negatief";
  return rating;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/data", { credentials: "same-origin" });
        if (!res.ok) {
          if (!cancelled) {
            setLoadError("Kon dashboarddata niet laden.");
          }
          return;
        }
        const json = (await res.json()) as AdminDashboardPayload;
        if (!cancelled) {
          setData(json);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Kon dashboarddata niet laden.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "#F8F7F4" }}
    >
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
            className="rounded-lg bg-[#F8F7F4] px-3 py-2 font-medium text-[#1a1a1a]"
          >
            Dashboard
          </Link>
          <Link
            href="/admin#sessions"
            scroll
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-[#1a1a1a] hover:bg-[#F8F7F4]"
          >
            Sessies
          </Link>
          <Link
            href="/admin#feedback"
            scroll
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-[#1a1a1a] hover:bg-[#F8F7F4]"
          >
            Feedback
          </Link>
          <Link
            href="/admin#nurture"
            scroll
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-[#1a1a1a] hover:bg-[#F8F7F4]"
          >
            Nurture-mail
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
        <header className="flex items-center justify-between gap-4 border-b bg-white px-4 py-3 md:hidden" style={{ borderColor: "#e8e6e1" }}>
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
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-[#999]">Intake data-overzicht</p>
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
              <section
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                  data.affiliate ? "xl:grid-cols-5" : "xl:grid-cols-4"
                }`}
              >
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <p className="text-[13px] text-[#999]">Totaal sessies</p>
                  <p
                    className="mt-2 text-[32px] font-bold leading-none text-[#1a1a1a]"
                  >
                    {data.stats.totalSessions}
                  </p>
                  <p
                    className={`mt-2 text-[13px] ${
                      data.stats.sessionsWeekDelta >= 0
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {data.stats.sessionsWeekDelta >= 0 ? "+" : ""}
                    {data.stats.sessionsWeekDelta} t.o.v. vorige 7 dagen
                  </p>
                </div>
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <p className="text-[13px] text-[#999]">E-mailadressen</p>
                  <p
                    className="mt-2 text-[32px] font-bold leading-none text-[#1a1a1a]"
                  >
                    {data.stats.uniqueEmails}
                  </p>
                  <p className="mt-2 text-[13px] text-[#999]">
                    Uniek (marketing + reminders)
                  </p>
                </div>
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <p className="text-[13px] text-[#999]">Reminders verstuurd</p>
                  <p
                    className="mt-2 text-[32px] font-bold leading-none text-[#1a1a1a]"
                  >
                    {data.stats.remindersSent}
                  </p>
                </div>
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <p className="text-[13px] text-[#999]">Gem. totaalscore</p>
                  <p
                    className="mt-2 text-[32px] font-bold leading-none text-[#1a1a1a]"
                  >
                    {data.stats.avgTotalScore ?? "—"}
                  </p>
                </div>
                {data.affiliate ? (
                  <div
                    className="rounded-xl border bg-white p-6"
                    style={{ borderColor: "#e8e6e1" }}
                  >
                    <p className="text-[13px] text-[#999]">Totaal clicks</p>
                    <p
                      className="mt-2 text-[32px] font-bold leading-none text-[#1a1a1a]"
                    >
                      {data.affiliate.totalClicks}
                    </p>
                    <p className="mt-2 text-[13px] text-[#999]">
                      Affiliate links
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <h2 className="mb-4 text-lg font-semibold text-[#1a1a1a]">
                    Profielverdeling
                  </h2>
                  <div className="h-[280px] w-full">
                    {data.profileDistribution.length === 0 ? (
                      <p className="text-sm text-[#999]">Nog geen data.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.profileDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={56}
                            outerRadius={88}
                            paddingAngle={2}
                          >
                            {data.profileDistribution.map((_, i) => (
                              <Cell
                                key={`p-${i}`}
                                fill={PROFILE_FILL[i % PROFILE_FILL.length]!}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <h2 className="mb-4 text-lg font-semibold text-[#1a1a1a]">
                    Domeinscores gemiddeld
                  </h2>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.domainAverages}
                        margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                      >
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11 }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={56}
                        />
                        <YAxis tick={{ fontSize: 11 }} width={32} />
                        <Tooltip />
                        <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                          {data.domainAverages.map((d) => (
                            <Cell key={d.id} fill={d.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {data.nurture ? (
                <section
                  id="nurture"
                  className="scroll-mt-24 rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <h2 className="mb-4 text-lg font-semibold text-[#1a1a1a]">
                    Nurture e-mails
                  </h2>
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-[#F8F7F4] p-4">
                      <p className="text-[12px] text-[#999]">Gepland (pending)</p>
                      <p className="mt-1 text-xl font-semibold text-[#1a1a1a]">
                        {data.nurture.stats.pending}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#F8F7F4] p-4">
                      <p className="text-[12px] text-[#999]">Verstuurd</p>
                      <p className="mt-1 text-xl font-semibold text-[#1a1a1a]">
                        {data.nurture.stats.sent}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#F8F7F4] p-4">
                      <p className="text-[12px] text-[#999]">Mislukt</p>
                      <p className="mt-1 text-xl font-semibold text-[#1a1a1a]">
                        {data.nurture.stats.failed}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#F8F7F4] p-4">
                      <p className="text-[12px] text-[#999]">Geannuleerd</p>
                      <p className="mt-1 text-xl font-semibold text-[#1a1a1a]">
                        {data.nurture.stats.cancelled}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-[#1a1a1a]">
                        Verzonden per stap in de reeks
                      </h3>
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.nurture.sequenceSent.map((r) => ({
                              label: `Dag ${r.sequenceDay}`,
                              sent: r.sent,
                            }))}
                            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                          >
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} width={36} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="sent" fill="#1a1a1a" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center rounded-lg border p-4" style={{ borderColor: "#e8e6e1" }}>
                      <h3 className="mb-2 text-sm font-semibold text-[#1a1a1a]">
                        Dag 30 → herhaalmeting (indicatie)
                      </h3>
                      <p className="text-sm text-[#555]">
                        Van de <strong>{data.nurture.day30Conversion.day30Sent}</strong> verzonden
                        dag-30-mails heeft{" "}
                        <strong>{data.nurture.day30Conversion.repeatIntakeAfterMail}</strong>{" "}
                        minstens één latere intake-sessie met hetzelfde marketing-e-mailadres
                        (sessie gestart ná het verzendmoment van de dag-30-mail).
                      </p>
                      <p className="mt-3 text-sm text-[#555]">
                        Geschatte conversie:{" "}
                        <strong>
                          {data.nurture.day30Conversion.conversionRate != null
                            ? `${Math.round(data.nurture.day30Conversion.conversionRate * 1000) / 10}%`
                            : "—"}
                        </strong>
                      </p>
                      <p className="mt-2 text-xs text-[#999]">
                        Geen exacte attributie: iemand kan ook zonder de mail opnieuw meten.
                      </p>
                    </div>
                  </div>

                  <h3 className="mb-3 text-sm font-semibold text-[#1a1a1a]">
                    Recente nurture-mails
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr className="border-b text-[13px] text-[#999]" style={{ borderColor: "#e8e6e1" }}>
                          <th className="pb-3 pr-4 font-medium">E-mail</th>
                          <th className="pb-3 pr-4 font-medium">Dag</th>
                          <th className="pb-3 pr-4 font-medium">Status</th>
                          <th className="pb-3 font-medium">Gepland</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.nurture.recent.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-[#999]">
                              Nog geen rijen in nurture_emails.
                            </td>
                          </tr>
                        ) : (
                          data.nurture.recent.map((row, i) => (
                            <tr
                              key={`${row.scheduledAt}-${row.sequenceDay}-${i}`}
                              className="border-b last:border-b-0"
                              style={{ borderColor: "#e8e6e1" }}
                            >
                              <td className="py-3 pr-4 font-mono text-[13px] text-[#1a1a1a]">
                                {row.emailMasked}
                              </td>
                              <td className="py-3 pr-4 text-[#555]">{row.sequenceDay}</td>
                              <td className="py-3 pr-4 text-[#555]">{row.status}</td>
                              <td className="py-3 text-[#555]">
                                {formatNlDate(row.scheduledAt)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : (
                <section
                  id="nurture"
                  className="scroll-mt-24 rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-900"
                >
                  <h2 className="mb-2 text-lg font-semibold">Nurture e-mails</h2>
                  <p>
                    Kon nurture-statistieken niet laden (ontbrekende tabel of recht). Controleer of{" "}
                    <code className="rounded bg-amber-100/80 px-1">nurture_emails</code> bestaat in
                    Supabase.
                  </p>
                </section>
              )}

              {data.affiliate ? (
                <section
                  id="affiliate"
                  className="scroll-mt-24 rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <h2 className="mb-6 text-lg font-semibold text-[#1a1a1a]">
                    Affiliate clicks
                  </h2>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-[#1a1a1a]">
                        Clicks per product
                      </h3>
                      <div
                        className="w-full"
                        style={{
                          height: Math.min(
                            400,
                            40 +
                              Math.max(3, data.affiliate.clicksPerProduct.length) *
                                28,
                          ),
                        }}
                      >
                        {data.affiliate.clicksPerProduct.length === 0 ? (
                          <p className="text-sm text-[#999]">Nog geen data.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={data.affiliate.clicksPerProduct}
                              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                            >
                              <XAxis
                                type="number"
                                tick={{ fontSize: 11 }}
                                allowDecimals={false}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                width={140}
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
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-[#1a1a1a]">
                        Clicks per pagina
                      </h3>
                      <div
                        className="w-full"
                        style={{
                          height: Math.min(
                            400,
                            40 +
                              Math.max(3, data.affiliate.clicksPerPage.length) *
                                28,
                          ),
                        }}
                      >
                        {data.affiliate.clicksPerPage.length === 0 ? (
                          <p className="text-sm text-[#999]">Nog geen data.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={data.affiliate.clicksPerPage}
                              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                            >
                              <XAxis
                                type="number"
                                tick={{ fontSize: 11 }}
                                allowDecimals={false}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                width={160}
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
                  </div>

                  <h3 className="mb-3 mt-8 text-sm font-semibold text-[#1a1a1a]">
                    Recente clicks
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr
                          className="border-b text-[13px] text-[#999]"
                          style={{ borderColor: "#e8e6e1" }}
                        >
                          <th className="pb-3 pr-4 font-medium">Datum</th>
                          <th className="pb-3 pr-4 font-medium">Product</th>
                          <th className="pb-3 pr-4 font-medium">Categorie</th>
                          <th className="pb-3 font-medium">Pagina</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.affiliate.recentClicks.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-[#999]">
                              Nog geen affiliate-clicks.
                            </td>
                          </tr>
                        ) : (
                          data.affiliate.recentClicks.map((row, i) => (
                            <tr
                              key={`${row.timestamp}-${i}`}
                              className="border-b last:border-b-0"
                              style={{ borderColor: "#e8e6e1" }}
                            >
                              <td className="py-3 pr-4 text-[#1a1a1a]">
                                {formatNlDate(row.timestamp)}
                              </td>
                              <td className="py-3 pr-4 text-[#555]">
                                {row.productNaam}
                              </td>
                              <td className="py-3 pr-4 text-[#555]">
                                {row.categorie}
                              </td>
                              <td className="py-3 text-[#555]">
                                {row.pagina}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <h2 className="mb-4 text-lg font-semibold text-[#1a1a1a]">
                    Leeftijdsverdeling
                  </h2>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.ageDistribution}
                        margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                      >
                        <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 11 }} width={32} allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#1a1a1a"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div
                  id="feedback"
                  className="scroll-mt-24 rounded-xl border bg-white p-6"
                  style={{ borderColor: "#e8e6e1" }}
                >
                  <h2 className="mb-4 text-lg font-semibold text-[#1a1a1a]">
                    Recente feedback
                  </h2>
                  {data.recentFeedback.length === 0 ? (
                    <p className="text-sm text-[#999]">Nog geen feedback.</p>
                  ) : (
                    <ul className="flex max-h-[320px] flex-col gap-4 overflow-y-auto pr-1">
                      {data.recentFeedback.map((f, i) => (
                        <li
                          key={`${f.createdAt}-${i}`}
                          className="border-b pb-3 last:border-b-0"
                          style={{ borderColor: "#e8e6e1" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-[#1a1a1a]">
                              {ratingLabel(f.rating)}
                            </span>
                            <span className="text-xs text-[#999]">
                              {formatNlDay(f.createdAt)}
                            </span>
                          </div>
                          {f.comment ? (
                            <p className="mt-1 text-sm text-[#555]">{f.comment}</p>
                          ) : (
                            <p className="mt-1 text-sm italic text-[#999]">
                              Geen opmerking
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <section
                id="sessions"
                className="scroll-mt-24 rounded-xl border bg-white p-6"
                style={{ borderColor: "#e8e6e1" }}
              >
                <h2 className="mb-4 text-lg font-semibold text-[#1a1a1a]">
                  Laatste sessies
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-[13px] text-[#999]" style={{ borderColor: "#e8e6e1" }}>
                        <th className="pb-3 pr-4 font-medium">Datum</th>
                        <th className="pb-3 pr-4 font-medium">Leeftijd</th>
                        <th className="pb-3 pr-4 font-medium">Profiel</th>
                        <th className="pb-3 pr-4 font-medium">Totaalscore</th>
                        <th className="pb-3 font-medium">Urgentie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentSessions.map((row, i) => (
                        <tr
                          key={`${row.createdAt}-${i}`}
                          className="border-b last:border-b-0"
                          style={{ borderColor: "#e8e6e1" }}
                        >
                          <td className="py-3 pr-4 text-[#1a1a1a]">
                            {formatNlDate(row.createdAt)}
                          </td>
                          <td className="py-3 pr-4 text-[#555]">
                            {row.ageRange ?? "—"}
                          </td>
                          <td className="py-3 pr-4 text-[#555]">
                            {row.profileLabel ?? "—"}
                          </td>
                          <td className="py-3 pr-4 text-[#555]">
                            {row.totalScore ?? "—"}
                          </td>
                          <td className="py-3 text-[#555]">
                            {row.urgency ?? "—"}
                          </td>
                        </tr>
                      ))}
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
