export const CENTS_PER_DOLLAR = 100

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

export function getSponsoredAmount(regrantorId: string) {
  const sponsoredRegrantors = {
    'e083e3b0-a131-4eaa-8a83-6a146a196432': 50_000, // Isaak
    'b11620f2-fdc7-414c-8a63-9ddee17ee669': 50_000, // Marcus
    '4de2634d-3802-4141-881e-9ce687f87485': 50_000, // Rachel
    '10bd8a14-4002-47ff-af4a-92b227423a74': 50_000, // Austin
    'e8448021-c0a2-4f1f-98b1-3e08d217b93d': 50_000, // Qualy
    '74f76b05-0e51-407e-82c3-1fb19518933c': 50_000, // Gavriel
    'fb21e9f3-9b84-4556-9228-2b65bc85a9dc': 50_000, // Zvi
    '0f0dd540-40a4-4976-a145-c6e82c2e98f5': 50_000, // Ted
    '8aa331b7-3602-4001-9bc6-2b71b1c8ddd1': 50_000, // Renan
    '1398ed62-4213-4923-a84e-a9931ae19492': 400_000, // Adam
    '94a0c7b8-39fd-4856-a7e6-1f9429dbb4ad': 400_000, // Dan Hendrycks
    'c0319265-58b4-40e3-821c-5d32a76cd650': 400_000, // Tristan
    '647c9b3c-65ce-40cf-9464-ac02c741aacd': 400_000, // Evan
    '75420de8-7e37-4971-bb29-9bfada0c453b': 400_000, // Leopold
  } as { [key: string]: number }
  return sponsoredRegrantors[regrantorId] ?? 0
}

const CHARITABLE_DEPOSITS = [
  '1e17c09d-aa7f-432a-b523-89691531b304',
  'c223e240-598f-41a9-8aa0-7a961d8db258',
]
export function isCharitableDeposit(txnId: string) {
  return CHARITABLE_DEPOSITS.includes(txnId)
}
