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
    case 'Manifold Community Fund':
      return 'indigo'
    default:
      return 'pink' //this should never happen
  }
}

export function getSponsoredAmount2023(regrantorId: string) {
  const sponsoredRegrantors = {
    'e083e3b0-a131-4eaa-8a83-6a146a196432': 50_000, // Isaak
    '4de2634d-3802-4141-881e-9ce687f87485': 50_000, // Rachel
    '10bd8a14-4002-47ff-af4a-92b227423a74': 50_000, // Austin
    '74f76b05-0e51-407e-82c3-1fb19518933c': 50_000, // Gavriel
    'fb21e9f3-9b84-4556-9228-2b65bc85a9dc': 50_000, // Zvi
    '0f0dd540-40a4-4976-a145-c6e82c2e98f5': 50_000, // Ted
    '8aa331b7-3602-4001-9bc6-2b71b1c8ddd1': 50_000, // Renan
    'aa7c88dc-7311-4577-8cd3-c58a0d41fc31': 50_000, // Joel
    'e2a30cdd-6797-4e2c-8823-f051195fc77a': 50_000, // Ryan
    '232dc139-961a-4f9a-9ca5-0118b90287c0': 50_000, // Nuno
    'b11620f2-fdc7-414c-8a63-9ddee17ee669': 100_000, // Marcus
    '1398ed62-4213-4923-a84e-a9931ae19492': 400_000, // Adam
    '94a0c7b8-39fd-4856-a7e6-1f9429dbb4ad': 400_000, // Dan Hendrycks
    'c0319265-58b4-40e3-821c-5d32a76cd650': 400_000, // Tristan
    '647c9b3c-65ce-40cf-9464-ac02c741aacd': 450_000, // Evan
    '75420de8-7e37-4971-bb29-9bfada0c453b': 400_000, // Leopold
  } as { [key: string]: number }
  return sponsoredRegrantors[regrantorId] ?? 0
}

export function getSponsoredAmount2024(regrantorId: string) {
  const sponsoredRegrantors = {
    '1398ed62-4213-4923-a84e-a9931ae19492': 250_000, // Adam
    '94a0c7b8-39fd-4856-a7e6-1f9429dbb4ad': 250_000, // Dan Hendrycks
    '647c9b3c-65ce-40cf-9464-ac02c741aacd': 250_000, // Evan
    '75420de8-7e37-4971-bb29-9bfada0c453b': 250_000, // Leopold
    'e2a30cdd-6797-4e2c-8823-f051195fc77a': 250_000, // Ryan
    'e9362a95-cbec-4685-b179-91b4c5ba4edc': 250_000, // Neel Nanda
  } as { [key: string]: number }
  return sponsoredRegrantors[regrantorId] ?? 0
}

export function getSponsoredAmount2025(regrantorId: string) {
  const sponsoredRegrantors = {
    'e9362a95-cbec-4685-b179-91b4c5ba4edc': 250_000, // Neel Nanda
    '4988c7d8-e1a6-4f2b-b9d9-f80cd02f1732': 100_000, // Lisa
    'aa7c88dc-7311-4577-8cd3-c58a0d41fc31': 100_000, // Joel
    'dd68802c-760d-4241-9431-352e1f635f6a': 100_000, // Lauren
    '8a2d245e-1cfe-4d93-8a74-82b2ed695f24': 100_000, // Gavin
    '9af369f0-dc1e-4577-9bb7-4ad4cb87131f': 100_000, // Marius
    '64803b9c-02ff-4d4f-9f4a-3261c8ef60f6': 100_000, // Thomas
    '7901a82c-00b3-40e6-ac1c-f56ff672fb18': 100_000, // Tamay
    '75d73803-3b02-4e20-826c-c7bd96127a9e': 100_000, // Richard
    'e2a30cdd-6797-4e2c-8823-f051195fc77a': 100_000, // Ryan
    'b11620f2-fdc7-414c-8a63-9ddee17ee669': 100_000, // Marcus
  } as { [key: string]: number }
  return sponsoredRegrantors[regrantorId] ?? 0
}

export function getSponsoredAmount(regrantorId: string, year?: number) {
  if (year === 2023) {
    return getSponsoredAmount2023(regrantorId)
  } else if (year === 2024) {
    return getSponsoredAmount2024(regrantorId)
  } else if (year === 2025) {
    return getSponsoredAmount2025(regrantorId)
  } else {
    return (
      getSponsoredAmount2023(regrantorId) +
      getSponsoredAmount2024(regrantorId) +
      getSponsoredAmount2025(regrantorId)
    )
  }
}

// Needed for people who are both accredited investors and regrantors
const CHARITABLE_DEPOSITS = [
  '1e17c09d-aa7f-432a-b523-89691531b304', // $50k from Manifund Bank to Zvi
  'c223e240-598f-41a9-8aa0-7a961d8db258', // $50k from Manifund Bank to Austin
]
export function isCharitableDeposit(txnId: string) {
  return CHARITABLE_DEPOSITS.includes(txnId)
}

export const CURRENT_AGREEMENT_VERSION = 3
