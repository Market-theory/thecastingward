// Shared-password gate for a 2-person internal tool.
// The cookie holds a SHA-256 digest derived from APP_PASSWORD, so changing
// the password in Vercel env vars invalidates every session at once.
// Uses Web Crypto only, so it runs in both Node and Edge (middleware).

export const AUTH_COOKIE = "cw_auth";

export async function expectedAuthToken(): Promise<string | null> {
  const password = process.env.APP_PASSWORD;
  if (!password) return null; // no password configured → gate disabled (local dev/mock)
  const data = new TextEncoder().encode(`casting-ward-v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
