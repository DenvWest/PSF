import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import { getAccountFromCookie } from "@/lib/account-server";

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
  const empty = state === "empty";
  const retest = state === "retest";

  return (
    <div className="ps-dark">
      <Dashboard empty={empty} checkId={retest ? "check2" : "check1"} retest={retest} />
    </div>
  );
}
