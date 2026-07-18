/**
 * Feature-flags via env. `NEXT_PUBLIC_`-prefix zodat dezelfde vlag isomorf leesbaar is
 * (server-API én client-UI). Een boolean-vlag is niet gevoelig; de API dwingt de vlag
 * server-side alsnog af. Standaard uit (unset → false).
 */
export function isMovementLogEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOVEMENT_LOG_ENABLED === "true";
}
