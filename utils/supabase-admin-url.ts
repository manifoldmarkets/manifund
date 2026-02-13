const SUPABASE_PROJECT_REF = 'fkousziwzbnkdkldjper'
const PROJECTS_TABLE_ID = '27111'

export function supabaseProjectRowUrl(projectId: string) {
  return `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/editor/${PROJECTS_TABLE_ID}?filter=id%3Aeq%3A${projectId}`
}
