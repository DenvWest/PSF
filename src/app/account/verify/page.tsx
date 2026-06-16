import type { Metadata } from "next";
import LinkExpiredScreen from "@/components/account/LinkExpiredScreen";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountVerifyPage() {
  // F1.2: hier komt de echte token-verify; succes → cookie + redirect /dashboard, fout → dit scherm
  return (
    <div className="ps-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <LinkExpiredScreen />
    </div>
  );
}
