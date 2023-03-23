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

export function getRoundTheme(roundTitle: string) {
  switch (roundTitle) {
    case 'ACX Mini-Grants':
      return 'indigo'
    case 'OpenPhil AI Worldview Prizes':
      return 'cyan'
    case 'Independent':
      return 'gray'
    default:
      return 'pink' //this should never happen
  }
}
