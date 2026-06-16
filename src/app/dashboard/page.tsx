"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = searchParams.get("state");

  const empty = state === "empty";
  const retest = state === "retest";
  const checkId = retest ? "check2" : "check1";

  const onCheck = useCallback(() => {
    if (empty) {
      router.push("/intake");
      return;
    }
    const target = document.getElementById("plan");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [empty, router]);

  const onLogout = useCallback(() => {
    // TODO(F1.2): POST /api/account/logout -> /account/login
    router.push("/");
  }, [router]);

  return (
    <Dashboard
      empty={empty}
      checkId={checkId}
      retest={retest}
      onLogout={onLogout}
      onCheck={onCheck}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPageContent />
    </Suspense>
  );
}
