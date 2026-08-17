// Tokens for the emailed grant-agreement signing link.
//
// The signatory of an org agreement is often someone with no Manifund account
// (e.g. the fiscal sponsor's director), so the link itself is the credential.
// Only the sha256 of a token is ever stored, so a leaked database row can't be
// used to sign anything.
//
// Uses Web Crypto so this works in the edge runtime that the Pages Router API
// routes here run under.

export const SIGNING_TOKEN_TTL_DAYS = 30

function toBase64Url(bytes: Uint8Array) {
  const binary = String.fromCharCode(...bytes)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// 32 bytes of CSPRNG output: far beyond guessing range for an unauthenticated
// endpoint that has no rate limit of its own.
export function generateSigningToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return toBase64Url(bytes)
}

export async function hashSigningToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function signingTokenExpiry(from = new Date()) {
  return new Date(from.getTime() + SIGNING_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
}
