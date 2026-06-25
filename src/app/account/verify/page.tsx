import type { Metadata } from "next";
import VerifyAccountScreen from "@/components/account/VerifyAccountScreen";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = Promise<{ aid?: string; code?: string }>;

export default async function AccountVerifyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { aid, code } = await searchParams;

  return (
    <div className="ps-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <VerifyAccountScreen aid={aid ?? null} code={code ?? null} />
    </div>
  );
}
