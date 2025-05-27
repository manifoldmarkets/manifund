#!/usr/bin/env bun
/// <reference types="bun-types" />
import { $ } from 'bun'
import { writeFileSync } from 'fs'

async function main() {
  // Get local Supabase configuration
  const status = (await $`npx supabase status`.text()).split('\n')

  const apiUrl = status
    .find((line: string) => line.includes('API URL:'))
    ?.replace(/.*API URL: */, '')

  const anonKey = status
    .find((line: string) => line.includes('anon key:'))
    ?.replace(/.*anon key: */, '')

  const serviceRoleKey = status
    .find((line: string) => line.includes('service_role key:'))
    ?.replace(/.*service_role key: */, '')

  const storageUrl = status
    .find((line: string) => line.includes('S3 Storage URL:'))
    ?.replace(/.*S3 Storage URL: */, '')

  // Create .env.development.local content
  const envContent = `# Local Supabase Configuration (auto-generated)
# This file is used when running 'bun run dev'
NEXT_PUBLIC_SUPABASE_URL=${apiUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}
SUPABASE_BUCKET_URL=${storageUrl}
`

  // Write to .env.development.local
  writeFileSync('.env.development.local', envContent)

  console.log('Created .env.development.local with local Supabase config')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
