import { Suspense } from "react";
import VoortgangReturnLink from "@/components/dashboard/VoortgangReturnLink";

type VoortgangReturnBannerProps = {
  surface: "supplementen" | "beste" | "gids";
};

export function VoortgangReturnBanner({ surface }: VoortgangReturnBannerProps) {
  return (
    <Suspense fallback={null}>
      <VoortgangReturnLink surface={surface} />
    </Suspense>
  );
}
