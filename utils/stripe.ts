import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '@/db/env'

// Server-side Stripe client (live or test key per SUPABASE_ENV).
// Do not import from client components.
export const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
  typescript: true,
})
