import { createMcpHandler } from 'mcp-handler'
import { registerPublicTools, SERVER_INSTRUCTIONS } from './register-tools'

export const runtime = 'nodejs'

// Serves the public MCP server at the clean URL /api/mcp (Streamable HTTP).
// The sibling [transport] route covers /api/mcp/mcp and /api/mcp/sse.
const handler = createMcpHandler(
  (server) => {
    registerPublicTools(server, { admin: false })
  },
  { instructions: SERVER_INSTRUCTIONS },
  {
    basePath: '/api',
    maxDuration: 120,
  }
)

export { handler as GET, handler as POST }
