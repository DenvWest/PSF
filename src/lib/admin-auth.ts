export const ADMIN_TOKEN_COOKIE_NAME = "admin_token";

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim();
}

export function isValidAdminSessionCookie(token: string | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret || token == null || token === "") {
    return false;
  }
  return token === secret;
}
