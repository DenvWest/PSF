import Dashboard from "@/components/dashboard/Dashboard";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type DashboardPageProps = {
  searchParams: Promise<{ state?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { state } = await searchParams;
  const empty = state === "empty";
  const retest = state === "retest";

  // F1.4: gate achter getAccountFromCookie + proxy; nu nog open.
  return (
    <div className="ps-dark">
      <Dashboard empty={empty} checkId={retest ? "check2" : "check1"} retest={retest} />
    </div>
  );
}
