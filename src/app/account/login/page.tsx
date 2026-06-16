import type { Metadata } from "next";
import LoginScreen from "@/components/account/LoginScreen";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLoginPage() {
  return (
    <div className="ps-dark" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <LoginScreen />
    </div>
  );
}
