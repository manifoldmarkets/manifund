import { MiniCause } from '@/db/cause'

let loadedPreferences: string[] = []

export function loadUserPreferences(): string[] {
  // Return cached preferences if already loaded
  if (loadedPreferences.length > 0) {
    return loadedPreferences
  }

  // Only run on client side
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const saved = localStorage.getItem('user_cause_preferences')
    loadedPreferences = saved ? JSON.parse(saved) : []
    return loadedPreferences
  } catch (error) {
    console.error('Error loading user preferences:', error)
    loadedPreferences = []
    return []
  }
}

export function saveUserPreferences(causes: MiniCause[]) {
  try {
    const causeSlugs = causes.map((cause) => cause.slug)
    localStorage.setItem('user_cause_preferences', JSON.stringify(causeSlugs))
    loadedPreferences = causeSlugs
  } catch (error) {
    console.error('Error saving user preferences:', error)
  }
}
