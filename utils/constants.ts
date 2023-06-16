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

export function getSponsoredText(regrantorName: string) {
  switch (regrantorName) {
    case 'Isaak Freeman':
      return '$50K'
    case 'Marcus Abramovitch':
      return '$50K'
    case 'Rachel Weinberg':
      return '$50K'
    case 'Austin Chen':
      return '$50K'
    case 'Adam Gleave':
      return '$400K'
    case 'Dan Hendryks':
      return '$400K'
    default:
      return null
  }
}
