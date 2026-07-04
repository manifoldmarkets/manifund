import { createMcpHandler } from 'mcp-handler'
import { registerPublicTools, SERVER_INSTRUCTIONS } from '../register-tools'

export const runtime = 'nodejs'

// Public Manifund MCP server: read-only access to public data.
// Connect from Claude et al. at https://manifund.org/api/mcp
const handler = createMcpHandler(
  (server) => {
    registerPublicTools(server, { admin: false })
  },
  { instructions: SERVER_INSTRUCTIONS },
  {
    basePath: '/api/mcp',
    maxDuration: 120,
  }
)

export { handler as GET, handler as POST }
