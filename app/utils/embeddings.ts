import { createAdminSupabaseClient } from '@/db/supabase-server'
import { JSONContent } from '@tiptap/core'
import { toMarkdown } from '@/utils/tiptap-parsing'
import OpenAI from 'openai'

export const EMBEDDING_MODELS = {
  'text-embedding-3-large': { dimension: 3072 },
} as const

export type EmbeddingModel = keyof typeof EMBEDDING_MODELS

export const DEFAULT_EMBEDDING_MODEL = (process.env.OPENAI_EMBEDDING_MODEL ||
  'text-embedding-3-large') as EmbeddingModel

if (!(DEFAULT_EMBEDDING_MODEL in EMBEDDING_MODELS)) {
  throw new Error(
    `Invalid OPENAI_EMBEDDING_MODEL: "${DEFAULT_EMBEDDING_MODEL}". Must be one of: ${Object.keys(
      EMBEDDING_MODELS
    ).join(', ')}`
  )
}

export async function generateEmbedding(
  text: string,
  model: EmbeddingModel = DEFAULT_EMBEDDING_MODEL
): Promise<{ embedding: number[]; model: string; dimension: number }> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await openai.embeddings.create({
    model: model,
    input: text,
  })

  return {
    embedding: response.data[0].embedding,
    model: model,
    dimension: EMBEDDING_MODELS[model].dimension,
  }
}

export function createProjectEmbeddingText(project: {
  title: string
  blurb: string | null
  description: JSONContent | null
  creator?: {
    full_name?: string | null
    bio?: string | null
  } | null
  causes?: Array<{
    title: string
    slug: string
  }> | null
}): string {
  const sections = []

  // Title section (most important)
  sections.push(`# ${project.title}`)

  // Author section
  if (project.creator) {
    const authorParts = []
    if (project.creator.full_name) {
      authorParts.push(`**Author:** ${project.creator.full_name}`)
    }
    if (project.creator.bio) {
      authorParts.push(`**Bio:** ${project.creator.bio}`)
    }
    if (authorParts.length > 0) {
      sections.push(`## Author\n${authorParts.join('\n')}`)
    }
  }

  // Causes section
  if (project.causes && project.causes.length > 0) {
    const causesList = project.causes.map((cause) => `- ${cause.title}`).join('\n')
    sections.push(`## Causes\n${causesList}`)
  }

  // Blurb section (short summary)
  if (project.blurb) {
    sections.push(`## Summary\n${project.blurb}`)
  }

  // Description section (detailed content)
  if (project.description) {
    const descriptionText = toMarkdown(project.description)
    if (descriptionText.trim()) {
      sections.push(`## Description\n${descriptionText}`)
    }
  }

  return sections.join('\n\n')
}

export async function updateProjectEmbedding(
  projectId: string,
  model: EmbeddingModel = DEFAULT_EMBEDDING_MODEL
) {
  const supabase = createAdminSupabaseClient()

  // Get project data with creator information and causes
  const { data: project, error } = await supabase
    .from('projects')
    .select(
      `
      title, 
      description, 
      blurb,
      creator,
      profiles!projects_creator_fkey(
        full_name,
        bio
      ),
      project_causes(
        causes(
          title,
          slug
        )
      )
    `
    )
    .eq('id', projectId)
    .single()

  if (error || !project) {
    throw new Error(`Failed to fetch project: ${error?.message}`)
  }

  // Create text for embedding with creator info and causes
  const projectForEmbedding = {
    title: project.title,
    blurb: project.blurb,
    description: project.description as JSONContent | null,
    creator: project.profiles
      ? {
          full_name: project.profiles.full_name,
          bio: project.profiles.bio,
        }
      : null,
    causes:
      project.project_causes
        ?.map((pc) => pc.causes)
        .filter((cause): cause is { title: string; slug: string } => cause !== null) || null,
  }
  const textContent = createProjectEmbeddingText(projectForEmbedding)

  // Generate embedding with model info
  const { embedding, model: usedModel, dimension } = await generateEmbedding(textContent, model)

  // Check if embedding already exists
  const { data: existingEmbedding } = await (supabase as any)
    .from('project_embeddings')
    .select('id')
    .eq('project_id', projectId)
    .single()

  if (existingEmbedding) {
    // Update existing embedding
    const { error: updateError } = await (supabase as any)
      .from('project_embeddings')
      .update({
        embedding,
        model_name: usedModel,
        model_dimension: dimension,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)

    if (updateError) {
      throw new Error(`Failed to update embedding: ${updateError.message}`)
    }
  } else {
    // Insert new embedding
    const { error: insertError } = await (supabase as any).from('project_embeddings').insert({
      project_id: projectId,
      embedding,
      model_name: usedModel,
      model_dimension: dimension,
    })

    if (insertError) {
      throw new Error(`Failed to insert embedding: ${insertError.message}`)
    }
  }
}

export interface EmbeddingSyncOptions {
  model?: EmbeddingModel
  batchSize?: number
  force?: boolean
  onProgress?: (progress: {
    processed: number
    total: number
    errors: number
    currentProject?: string
    status: 'processing' | 'complete' | 'error'
  }) => void
}

export async function syncProjectEmbeddings(options: EmbeddingSyncOptions = {}) {
  const { model = DEFAULT_EMBEDDING_MODEL, batchSize = 5, force = false, onProgress } = options

  const supabase = createAdminSupabaseClient()

  // Get all projects
  const { data: allProjects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title')
    .order('created_at', { ascending: false })

  if (projectsError || !allProjects) {
    throw new Error(`Failed to fetch projects: ${projectsError?.message}`)
  }

  let projectsToProcess = allProjects

  if (!force) {
    // Get projects that already have embeddings for this model
    const { data: existingEmbeddings } = await supabase
      .from('project_embeddings')
      .select('project_id')
      .eq('model_name', model)

    const embeddedProjectIds = new Set((existingEmbeddings || []).map((e) => e.project_id))

    projectsToProcess = allProjects.filter((p) => !embeddedProjectIds.has(p.id))
  }

  const total = projectsToProcess.length
  let processed = 0
  let errors = 0

  onProgress?.({
    processed: 0,
    total,
    errors: 0,
    status: 'processing',
  })

  // Process projects in batches
  for (let i = 0; i < projectsToProcess.length; i += batchSize) {
    const batch = projectsToProcess.slice(i, i + batchSize)

    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map(async (project) => {
        try {
          onProgress?.({
            processed,
            total,
            errors,
            currentProject: project.title,
            status: 'processing',
          })

          await updateProjectEmbedding(project.id, model)
          return { success: true }
        } catch (error) {
          console.error(`Failed to update embedding for ${project.title}:`, error)
          return { success: false, error }
        }
      })
    )

    // Count successes and failures
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        processed++
      } else {
        errors++
      }
    })

    onProgress?.({
      processed,
      total,
      errors,
      status: 'processing',
    })

    // Add delay between batches to avoid rate limiting
    if (i + batchSize < projectsToProcess.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  onProgress?.({
    processed,
    total,
    errors,
    status: 'complete',
  })

  return { processed, errors, total }
}
