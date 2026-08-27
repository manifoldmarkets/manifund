// Where to send someone after they sign in.
//
// The value arrives in a query string, so it is attacker-controlled: a link to
// manifund.org/login?next=https://evil.example would otherwise send a
// freshly-authenticated user straight off the site. Only same-site paths are
// allowed through, and anything else falls back to the home page.
export function safeNext(next: string | null | undefined, fallback = '/'): string {
  if (!next) return fallback
  // Must be a path on this site: one leading slash, and not "//host" or
  // "/\host", both of which browsers read as protocol-relative URLs.
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}
