export type MobileCtaIntent = "start" | "save" | "dashboard";

export type MobileCtaAction = {
  href: string;
  label: string;
  intent: MobileCtaIntent;
};

export function resolvePrimaryMobileCta(options: {
  isLoggedIn: boolean;
  hasIntakeSession: boolean;
}): MobileCtaAction {
  if (options.isLoggedIn) {
    return {
      href: "/dashboard",
      label: "Naar dashboard",
      intent: "dashboard",
    };
  }

  if (options.hasIntakeSession) {
    return {
      href: "/account/login",
      label: "Bewaar in dashboard",
      intent: "save",
    };
  }

  return {
    href: "/intake",
    label: "Doe de Leefstijlcheck",
    intent: "start",
  };
}
