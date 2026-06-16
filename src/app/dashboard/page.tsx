import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import { buildDevDashboardData } from "@/lib/dashboard-dev-data";

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
  const account = await getAccountFromCookie();
  if (!account) {
    redirect("/account/login");
  }

  const { state } = await searchParams;
  if (state === "empty") {
    return (
      <div className="ps-dark">
        <Dashboard empty />
      </div>
    );
  }

  if (state === "scored") {
    return (
      <div className="ps-dark">
        <Dashboard data={buildDevDashboardData("scored")} />
      </div>
    );
  }

  if (state === "retest") {
    return (
      <div className="ps-dark">
        <Dashboard data={buildDevDashboardData("retest")} />
      </div>
    );
  }

  const data = await loadAccountDashboardData(account.id);

  return (
    <div className="ps-dark">
      <Dashboard empty={data.empty} data={data} />
    </div>
  );
}
