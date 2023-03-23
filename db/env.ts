export const SUPABASE_ENV = process.env.NEXT_PUBLIC_SUPABASE_ENV ?? 'PROD'

export const SUPABASE_URL =
  SUPABASE_ENV === 'PROD'
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL_DEV
export const SUPABASE_ANON_KEY =
  SUPABASE_ENV === 'PROD'
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV
export const SUPABASE_SERVICE_ROLE_KEY =
  SUPABASE_ENV === 'PROD'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY_DEV

export const SUPABASE_BUCKET_URL = 'https://fkousziwzbnkdkldjper.supabase.co'
