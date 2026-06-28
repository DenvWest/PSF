import { hasVoortgangReturnParam } from "@/lib/voortgang-return-link";

export type AccountLoginFrom = "intake" | "voortgang";

export function parseAccountLoginFrom(
  from?: string,
): AccountLoginFrom | "default" {
  if (from === "intake") {
    return "intake";
  }
  if (from === "voortgang") {
    return "voortgang";
  }
  return "default";
}

export function buildAccountLoginHref(options: {
  hasIntakeSession?: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}): string {
  if (options.hasIntakeSession) {
    return "/account/login?from=intake";
  }
  if (options.searchParams && hasVoortgangReturnParam(options.searchParams)) {
    return "/account/login?from=voortgang";
  }
  return "/account/login";
}
