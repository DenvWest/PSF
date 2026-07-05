import { DASHBOARD_ROUTE_PREVIEW } from "@/data/dashboard-route";
import { DASHBOARD_TABS } from "@/data/dashboard";

const ANNOTATED_TABS = new Set(["vandaag", "voortgang", "hermeting"]);

const TAB_ANNOTATIONS: Partial<Record<(typeof DASHBOARD_TABS)[number]["id"], string>> = {
  vandaag: "Hier zie je je score, habit en prioriteit",
  voortgang: "Hier volg je scores en trends over tijd",
  hermeting: "Hier plan je je volgende meting",
};

type DashboardPreviewMockupProps = {
  embedded?: boolean;
  contentOnly?: boolean;
};

export function DashboardPreviewContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="-mx-4 overflow-x-auto border-b border-white/10 px-3 pb-3 md:-mx-5 md:px-4">
        <nav aria-label="Dashboard tabbladen" className="flex min-w-max gap-1">
          {DASHBOARD_TABS.map((tab, index) => (
            <span
              key={tab.id}
              className={`rounded-t-lg px-3 py-2 text-xs font-medium ${
                index === 0 ? "bg-[#0f1c10] text-white" : "text-stone-400"
              }`}
            >
              {tab.label}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 flex-col space-y-3 pt-4">
        <div className="rounded-xl border border-white/10 bg-[#0f1c10] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
            Vandaag
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {DASHBOARD_TABS[0]?.subtitle}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/5 rounded-full bg-ps-green" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-stone-400">
            Slaap · Stress · Voeding · Beweging — scores op één scherm
          </p>
        </div>

        <ul className="space-y-2">
          {DASHBOARD_TABS.filter((tab) => ANNOTATED_TABS.has(tab.id)).map(
            (tab) => (
              <li
                key={tab.id}
                className="rounded-lg border border-white/8 bg-white/5 px-3 py-2.5"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-xs font-semibold text-ps-green">
                    {tab.label}
                  </span>
                  <span className="text-xs text-stone-500">{tab.subtitle}</span>
                </div>
                {TAB_ANNOTATIONS[tab.id] ? (
                  <p className="mt-1 text-xs leading-relaxed text-stone-400">
                    → {TAB_ANNOTATIONS[tab.id]}
                  </p>
                ) : null}
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

export default function DashboardPreviewMockup({
  embedded = false,
  contentOnly = false,
}: DashboardPreviewMockupProps) {
  if (contentOnly) {
    return <DashboardPreviewContent />;
  }

  return (
    <section
      aria-labelledby={embedded ? undefined : "dashboard-preview"}
      className={embedded ? "" : "mb-10"}
    >
      {embedded ? null : (
        <header className="mb-5">
          <h2
            id="dashboard-preview"
            className="font-serif text-2xl text-stone-900 md:text-3xl"
          >
            {DASHBOARD_ROUTE_PREVIEW.title}
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-stone-600">
            {DASHBOARD_ROUTE_PREVIEW.subtitle}
          </p>
        </header>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 shadow-lg">
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
            Dashboard preview
          </p>
          <p className="mt-0.5 font-serif text-lg text-white">Jouw overzicht</p>
        </div>

        <div className="flex min-h-[280px] flex-col bg-[#1a2e1c] p-4 md:p-5">
          <DashboardPreviewContent />
        </div>
      </div>
    </section>
  );
}
