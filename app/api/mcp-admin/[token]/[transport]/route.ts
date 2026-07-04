import { timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'
import { createMcpHandler } from 'mcp-handler'
import {
  registerAdminTools,
  registerPublicTools,
  SERVER_INSTRUCTIONS,
} from '@/app/api/mcp/register-tools'

export const runtime = 'nodejs'

// Admin Manifund MCP server, gated by a secret path token (like Zapier/Composio
// MCP URLs). Exposes everything the public server does — plus hidden projects,
// all txn types, user emails, balances, Stripe records, and read-only SQL.
// Connect at https://manifund.org/api/mcp-admin/<MCP_ADMIN_TOKEN>/mcp

function tokenMatches(token: string) {
  const expected = process.env.MCP_ADMIN_TOKEN
  if (!expected || token.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

async function handler(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  if (!tokenMatches(token)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const mcpHandler = createMcpHandler(
    (server) => {
      registerPublicTools(server, { admin: true })
      registerAdminTools(server)
    },
    { instructions: SERVER_INSTRUCTIONS },
    {
      basePath: `/api/mcp-admin/${token}`,
      maxDuration: 120,
    }
  )
  return mcpHandler(req)
}

export { handler as GET, handler as POST }
