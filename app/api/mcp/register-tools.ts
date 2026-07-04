import 'server-only'

import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabaseClient } from '@/db/supabase-server'
import { generateEmbedding } from '@/app/utils/embeddings'
import { toMarkdown } from '@/utils/tiptap-parsing'

const SITE_URL = 'https://manifund.org'

// Untyped client: the aliased nested select strings below (e.g.
// from:profiles!txns_from_id_fkey(...)) blow up supabase-js type inference
// badly enough to OOM the TypeScript checker.
function adminDb(): SupabaseClient {
  return createAdminSupabaseClient() as unknown as SupabaseClient
}

// Txn types that are visible on the public site (donations pages, project ledgers)
const PUBLIC_TXN_TYPES = ['project donation', 'profile donation', 'tip']

type ToolResult = {
  content: { type: 'text'; text: string }[]
  isError?: boolean
}

function jsonResult(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
}

function errorResult(message: string): ToolResult {
  return { isError: true, content: [{ type: 'text', text: message }] }
}

async function run(fn: () => Promise<ToolResult>): Promise<ToolResult> {
  try {
    return await fn()
  } catch (e) {
    return errorResult(e instanceof Error ? e.message : String(e))
  }
}

// Strip characters that break PostgREST .or()/.ilike filter syntax
function sanitizeSearchTerm(query: string) {
  return query.replace(/[%_,()]/g, ' ').trim()
}

function projectUrl(slug: string) {
  return `${SITE_URL}/projects/${slug}`
}

function profileUrl(username: string) {
  return `${SITE_URL}/${username}`
}

const PROJECT_SUMMARY_SELECT = `
  id, title, slug, blurb, stage, type, funding_goal, min_funding, created_at,
  profiles!projects_creator_fkey(username, full_name),
  causes(slug, title),
  txns(amount, token)
`

function summarizeProject(project: any, extra?: Record<string, unknown>) {
  return {
    title: project.title,
    url: projectUrl(project.slug),
    slug: project.slug,
    blurb: project.blurb,
    stage: project.stage,
    type: project.type,
    funding_goal: project.funding_goal,
    min_funding: project.min_funding,
    total_raised: (project.txns ?? [])
      .filter((txn: any) => txn.token === 'USD')
      .reduce((acc: number, txn: any) => acc + txn.amount, 0),
    creator: project.profiles,
    causes: project.causes,
    created_at: project.created_at,
    ...extra,
  }
}

export function registerPublicTools(server: McpServer, options: { admin: boolean }) {
  const { admin } = options

  server.registerTool(
    'search_projects',
    {
      title: 'Search projects',
      description:
        'Search Manifund projects. If `query` is given, uses semantic (embedding) search, so natural-language descriptions like "AI safety video projects" work well. Otherwise lists recent projects, optionally filtered by cause or stage.',
      inputSchema: {
        query: z.string().optional().describe('Natural-language search query'),
        cause: z.string().optional().describe('Cause slug to filter by (see list_causes)'),
        stage: z
          .enum(['proposal', 'active', 'complete', 'not funded'])
          .optional()
          .describe('Filter by project stage'),
        limit: z.number().int().min(1).max(50).default(10),
      },
    },
    async ({ query, cause, stage, limit }) =>
      run(async () => {
        const db = adminDb()

        let matches: { id: string; similarity: number }[] | null = null
        if (query && process.env.OPENAI_API_KEY) {
          try {
            const { embedding } = await generateEmbedding(query)
            const { data } = await (db.rpc as any)('search_projects_by_embedding', {
              query_embedding: embedding,
              match_count: limit * 3,
              include_hidden: admin,
            }).throwOnError()
            matches = data
          } catch (e) {
            console.error('Semantic search failed, falling back to text search:', e)
          }
        }

        let dbQuery = db
          .from('projects')
          .select(
            cause
              ? PROJECT_SUMMARY_SELECT.replace('causes(', 'causes!inner(')
              : PROJECT_SUMMARY_SELECT
          )
          .neq('type', 'dummy')
        if (!admin) {
          dbQuery = dbQuery.neq('stage', 'hidden').neq('stage', 'draft')
        }
        if (matches) {
          dbQuery = dbQuery.in(
            'id',
            matches.map((m) => m.id)
          )
        } else if (query) {
          // Text fallback when embeddings are unavailable: match any word
          const words = sanitizeSearchTerm(query)
            .split(/\s+/)
            .filter((w) => w.length > 2)
          if (words.length > 0) {
            dbQuery = dbQuery.or(
              words.flatMap((w) => [`title.ilike.*${w}*`, `blurb.ilike.*${w}*`]).join(',')
            )
          }
        }
        if (cause) dbQuery = dbQuery.eq('causes.slug', cause)
        if (stage) dbQuery = dbQuery.eq('stage', stage)
        if (!matches) dbQuery = dbQuery.order('created_at', { ascending: false })

        const { data } = await dbQuery.limit(matches ? limit * 3 : limit).throwOnError()
        const projects = (data ?? []) as any[]

        if (matches) {
          const order = new Map(matches.map((m, i) => [m.id, i]))
          projects.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
        }
        const results = projects
          .slice(0, limit)
          .map((p) =>
            summarizeProject(p, { similarity: matches?.find((m) => m.id === p.id)?.similarity })
          )
        return jsonResult(results)
      })
  )

  server.registerTool(
    'get_project',
    {
      title: 'Get project details',
      description:
        'Get full details for one project by slug: description (markdown), funding, donations with donor names, causes, and similar projects.',
      inputSchema: {
        slug: z
          .string()
          .describe(
            'Project slug, e.g. from search_projects or a manifund.org/projects/<slug> URL'
          ),
      },
    },
    async ({ slug }) =>
      run(async () => {
        const db = adminDb()
        const { data: project } = await db
          .from('projects')
          .select(
            `
            id, title, slug, blurb, description, stage, type, funding_goal, min_funding,
            created_at, external_link, location_description,
            profiles!projects_creator_fkey(username, full_name),
            causes(slug, title),
            txns(amount, token, type, created_at, from:profiles!txns_from_id_fkey(username, full_name))
          `
          )
          .eq('slug', slug)
          .maybeSingle()
          .throwOnError()

        if (!project || (!admin && ['hidden', 'draft'].includes(project.stage))) {
          return errorResult(`No project found with slug "${slug}"`)
        }

        const { data: similar } = await db
          .rpc('find_similar_projects', { project_id: project.id, match_count: 5 })
          .throwOnError()

        const donations = (project.txns ?? [])
          .filter(
            (txn: any) => txn.token === 'USD' && (admin || PUBLIC_TXN_TYPES.includes(txn.type))
          )
          .map((txn: any) => ({
            amount: txn.amount,
            type: txn.type,
            from: txn.from,
            created_at: txn.created_at,
          }))

        return jsonResult({
          title: project.title,
          url: projectUrl(project.slug),
          creator: project.profiles,
          stage: project.stage,
          type: project.type,
          blurb: project.blurb,
          description: toMarkdown(project.description),
          funding_goal: project.funding_goal,
          min_funding: project.min_funding,
          total_raised: donations.reduce((acc: number, txn: any) => acc + txn.amount, 0),
          external_link: project.external_link,
          location: project.location_description,
          causes: project.causes,
          created_at: project.created_at,
          donations,
          similar_projects: (similar ?? []).map((s: any) => ({
            title: s.title,
            url: projectUrl(s.slug),
            similarity: s.similarity,
          })),
        })
      })
  )

  server.registerTool(
    'search_users',
    {
      title: 'Search users',
      description: 'Search Manifund user profiles by username or full name.',
      inputSchema: {
        query: z.string().describe('Name or username to search for'),
        limit: z.number().int().min(1).max(50).default(10),
      },
    },
    async ({ query, limit }) =>
      run(async () => {
        const db = adminDb()
        const q = sanitizeSearchTerm(query)
        const { data: profiles } = await db
          .from('profiles')
          .select('username, full_name, bio, type, regranter_status, accreditation_status')
          .or(`username.ilike.*${q}*,full_name.ilike.*${q}*`)
          .limit(limit)
          .throwOnError()
        return jsonResult((profiles ?? []).map((p) => ({ ...p, url: profileUrl(p.username) })))
      })
  )

  server.registerTool(
    'get_user',
    {
      title: 'Get user details',
      description:
        'Get a user profile by username, with the projects they created and their donations given and received.',
      inputSchema: {
        username: z.string(),
      },
    },
    async ({ username }) =>
      run(async () => {
        const db = adminDb()
        const { data: profile } = await db
          .from('profiles')
          .select(
            'id, username, full_name, bio, website, type, regranter_status, accreditation_status'
          )
          .eq('username', username)
          .maybeSingle()
          .throwOnError()
        if (!profile) return errorResult(`No user found with username "${username}"`)

        let projectQuery = db
          .from('projects')
          .select('title, slug, stage, blurb, created_at')
          .eq('creator', profile.id)
          .order('created_at', { ascending: false })
        if (!admin) projectQuery = projectQuery.neq('stage', 'hidden').neq('stage', 'draft')
        const { data: projects } = await projectQuery.throwOnError()

        const txnSelect = `
          amount, token, type, created_at,
          from:profiles!txns_from_id_fkey(username, full_name),
          to:profiles!txns_to_id_fkey(username, full_name),
          project:projects(title, slug)
        `
        let txnQuery = db
          .from('txns')
          .select(txnSelect)
          .or(`from_id.eq.${profile.id},to_id.eq.${profile.id}`)
          .eq('token', 'USD')
          .order('created_at', { ascending: false })
          .limit(100)
        if (!admin) txnQuery = txnQuery.in('type', PUBLIC_TXN_TYPES)
        const { data: txns } = await txnQuery.throwOnError()

        return jsonResult({
          ...profile,
          id: admin ? profile.id : undefined,
          url: profileUrl(profile.username),
          projects: (projects ?? []).map((p) => ({ ...p, url: projectUrl(p.slug) })),
          recent_txns: txns,
        })
      })
  )

  server.registerTool(
    'get_txns',
    {
      title: 'Get transactions',
      description: admin
        ? 'Query money transactions, filtered by user, project, type, and date range. Includes all txn types (donations, deposits, withdrawals, trades).'
        : 'Query public donation transactions, filtered by user, project, and date range.',
      inputSchema: {
        username: z.string().optional().describe('Only txns sent or received by this user'),
        project_slug: z.string().optional().describe('Only txns for this project'),
        type: z.string().optional().describe('Txn type, e.g. "project donation"'),
        token: z.string().default('USD').describe('"USD" for money; certs use other tokens'),
        after: z.string().optional().describe('ISO date, only txns after this'),
        before: z.string().optional().describe('ISO date, only txns before this'),
        limit: z.number().int().min(1).max(500).default(100),
      },
    },
    async ({ username, project_slug, type, token, after, before, limit }) =>
      run(async () => {
        const db = adminDb()

        let query = db
          .from('txns')
          .select(
            `
            id, amount, token, type, created_at,
            from:profiles!txns_from_id_fkey(username, full_name),
            to:profiles!txns_to_id_fkey(username, full_name),
            project:projects(title, slug)
          `
          )
          .order('created_at', { ascending: false })
          .limit(limit)

        if (token) query = query.eq('token', token)
        if (!admin) {
          if (type && !PUBLIC_TXN_TYPES.includes(type)) {
            return errorResult(`Only these txn types are public: ${PUBLIC_TXN_TYPES.join(', ')}`)
          }
          query = query.in('type', type ? [type] : PUBLIC_TXN_TYPES)
        } else if (type) {
          query = query.eq('type', type)
        }
        if (username) {
          const { data: profile } = await db
            .from('profiles')
            .select('id')
            .eq('username', username)
            .maybeSingle()
            .throwOnError()
          if (!profile) return errorResult(`No user found with username "${username}"`)
          query = query.or(`from_id.eq.${profile.id},to_id.eq.${profile.id}`)
        }
        if (project_slug) {
          const { data: project } = await db
            .from('projects')
            .select('id')
            .eq('slug', project_slug)
            .maybeSingle()
            .throwOnError()
          if (!project) return errorResult(`No project found with slug "${project_slug}"`)
          query = query.eq('project', project.id)
        }
        if (after) query = query.gte('created_at', new Date(after).toISOString())
        if (before) query = query.lte('created_at', new Date(before).toISOString())

        const { data: txns } = await query.throwOnError()
        return jsonResult(txns)
      })
  )

  server.registerTool(
    'list_causes',
    {
      title: 'List causes',
      description:
        'List all cause areas / funding rounds on Manifund, with their slugs for filtering.',
      inputSchema: {},
    },
    async () =>
      run(async () => {
        const db = adminDb()
        const { data: causes } = await db
          .from('causes')
          .select('slug, title, subtitle, open, prize')
          .order('sort')
          .throwOnError()
        return jsonResult(causes)
      })
  )
}

export function registerAdminTools(server: McpServer) {
  server.registerTool(
    'query_sql',
    {
      title: 'Run read-only SQL',
      description:
        'Run an arbitrary read-only SQL query (single SELECT statement) against the Manifund Postgres database. Use get_database_schema first to see tables and columns. Results are capped at max_rows.',
      inputSchema: {
        sql: z.string().describe('A single SELECT statement (no trailing semicolon needed)'),
        max_rows: z.number().int().min(1).max(1000).default(200),
      },
    },
    async ({ sql, max_rows }) =>
      run(async () => {
        const cleaned = sql.trim().replace(/;+\s*$/, '')
        if (cleaned.includes(';')) {
          return errorResult('Only a single SQL statement is allowed')
        }
        const db = adminDb()
        const { data } = await (db.rpc as any)('execute_readonly_sql', {
          query: cleaned,
          max_rows,
        }).throwOnError()
        return jsonResult(data)
      })
  )

  server.registerTool(
    'get_database_schema',
    {
      title: 'Get database schema',
      description:
        'List all tables and columns in the Manifund database, with notes on key semantics.',
      inputSchema: {},
    },
    async () =>
      run(async () => {
        const db = adminDb()
        const { data } = await (db.rpc as any)('execute_readonly_sql', {
          query: `
            select table_name, column_name, data_type
            from information_schema.columns
            where table_schema = 'public'
            order by table_name, ordinal_position
          `,
          max_rows: 1000,
        }).throwOnError()
        return jsonResult({
          notes: [
            'txns: money movements. token = "USD" for dollars; other tokens are impact cert shares. from_id/to_id reference profiles(id); from_id is null for deposits (money entering from outside).',
            `txn types: profile donation, project donation, user to user trade, user to amm trade, withdraw, deposit, cash to charity transfer, inject amm liquidity, mint cert, mana deposit, tip, return bank funds.`,
            'projects.stage: proposal, active, not funded, complete, hidden, draft. projects.creator references profiles(id).',
            'profiles: all users and orgs. The users view maps profile id -> auth email.',
            'bids: pending offers/donations that have not yet become txns.',
            'stripe_txns: Stripe checkout records; txn_id references the resulting deposit txn.',
            'Amounts are in dollars (not cents).',
          ],
          columns: data,
        })
      })
  )

  server.registerTool(
    'get_user_balances',
    {
      title: 'Get user balances',
      description: 'Get current USD balances for all users (or a specific set of usernames).',
      inputSchema: {
        usernames: z
          .array(z.string())
          .optional()
          .describe('If omitted, returns all users with balances'),
      },
    },
    async ({ usernames }) =>
      run(async () => {
        const db = adminDb()
        const { data: balances } = await db.rpc('get_user_balances').throwOnError()
        const filtered = usernames
          ? (balances ?? []).filter((b) => usernames.includes(b.username))
          : balances
        return jsonResult(filtered)
      })
  )

  server.registerTool(
    'lookup_users',
    {
      title: 'Look up users by email or username',
      description:
        'Match users by email address, username, or full name — returns id, username, full name, and email. Useful for reconciling external records (e.g. spreadsheets of named donors) against Manifund accounts.',
      inputSchema: {
        emails: z.array(z.string()).optional(),
        usernames: z.array(z.string()).optional(),
        full_names: z.array(z.string()).optional(),
      },
    },
    async ({ emails, usernames, full_names }) =>
      run(async () => {
        if (!emails?.length && !usernames?.length && !full_names?.length) {
          return errorResult('Provide at least one of emails, usernames, or full_names')
        }
        const db = adminDb()
        const ids = new Set<string>()

        if (emails?.length) {
          const { data } = await db.from('users').select('id').in('email', emails).throwOnError()
          data?.forEach((u) => u.id && ids.add(u.id))
        }
        if (usernames?.length || full_names?.length) {
          const filters = [
            ...(usernames ?? []).map((u) => `username.ilike.${sanitizeSearchTerm(u)}`),
            ...(full_names ?? []).map((n) => `full_name.ilike.*${sanitizeSearchTerm(n)}*`),
          ]
          const { data } = await db
            .from('profiles')
            .select('id')
            .or(filters.join(','))
            .throwOnError()
          data?.forEach((p) => ids.add(p.id))
        }
        if (ids.size === 0) return jsonResult([])

        const idList = Array.from(ids)
        const [{ data: profiles }, { data: users }] = await Promise.all([
          db
            .from('profiles')
            .select('id, username, full_name, type')
            .in('id', idList)
            .throwOnError(),
          db.from('users').select('id, email').in('id', idList).throwOnError(),
        ])
        const emailById = new Map((users ?? []).map((u) => [u.id, u.email]))
        return jsonResult(
          (profiles ?? []).map((p) => ({ ...p, email: emailById.get(p.id) ?? null }))
        )
      })
  )

  server.registerTool(
    'get_stripe_txns',
    {
      title: 'Get Stripe transactions',
      description:
        'Get Stripe checkout (deposit) records, with the depositor email, for reconciling against Stripe payouts.',
      inputSchema: {
        after: z.string().optional().describe('ISO date'),
        before: z.string().optional().describe('ISO date'),
        limit: z.number().int().min(1).max(500).default(100),
      },
    },
    async ({ after, before, limit }) =>
      run(async () => {
        const db = adminDb()
        let query = db
          .from('stripe_txns')
          .select('id, created_at, amount, session_id, customer_id, txn_id')
          .order('created_at', { ascending: false })
          .limit(limit)
        if (after) query = query.gte('created_at', new Date(after).toISOString())
        if (before) query = query.lte('created_at', new Date(before).toISOString())
        const { data: stripeTxns } = await query.throwOnError()

        const customerIds = Array.from(new Set((stripeTxns ?? []).map((t) => t.customer_id)))
        const { data: users } = await db
          .from('users')
          .select('id, email')
          .in('id', customerIds)
          .throwOnError()
        const emailById = new Map((users ?? []).map((u) => [u.id, u.email]))

        return jsonResult(
          (stripeTxns ?? []).map((t) => ({
            ...t,
            customer_email: emailById.get(t.customer_id) ?? null,
          }))
        )
      })
  )
}
