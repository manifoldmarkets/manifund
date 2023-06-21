export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  return url
}

export function getAdminName(adminEmail: string) {
  switch (adminEmail) {
    case 'rachel.weinberg12@gmail.com':
      return 'Rachel'
    case 'akrolsmir@gmail.com':
      return 'Austin'
    default:
      return null
  }
}

export function getRoundTheme(roundTitle: string) {
  switch (roundTitle) {
    case 'ACX Mini-Grants':
      return 'indigo'
    case 'OP AI Worldviews Contest':
      return 'sky'
    case 'Independent':
      return 'gray'
    case 'Regrants':
      return 'rose'
    case 'Regranters':
      return 'rose'
    default:
      return 'pink' //this should never happen
  }
}

export function getSponsoredAmount(regrantorName: string) {
  // TODO: Switch mapping from full name to username
  const sponsoredRegrantors = {
    'Isaak Freeman': 50_000,
    'Marcus Abramovitch': 50_000,
    'Rachel Weinberg': 50_000,
    'Austin Chen': 50_000,
    'Qualy the lightbulb ': 50_000,
    'Gavriel Kleinwaks': 50_000,
    'Zvi Mowshowitz': 50_000,
    'Adam Gleave': 400_000,
    'Dan Hendrycks': 400_000,
  } as { [key: string]: number }
  return sponsoredRegrantors[regrantorName] ?? 0
}
