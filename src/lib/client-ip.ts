import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  // Alleen x-real-ip vertrouwen: Nginx zet die met proxy_set_header (overschrijft,
  // append niet) op basis van $remote_addr — de client kan deze niet spoofen.
  // cf-connecting-ip en x-forwarded-for zijn dat wel: perfectsupplement.nl is
  // DNS-only (niet via Cloudflare geproxied), dus een client die rechtstreeks
  // verbindt kan die twee headers vrij zelf invullen.
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
