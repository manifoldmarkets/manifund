import { getURL } from '@/utils/constants'

// Kicks off background embedding + slop scoring for a project via the Node
// score-project route. Await this before responding: it returns as soon as
// the route ACKs (202) and the actual work continues there. Calling the
// scoring code directly from the Pages Router edge functions doesn't work -
// waitUntil doesn't reliably outlive the response in that runtime.
export async function triggerProjectScoring(projectId: string) {
  try {
    const res = await fetch(`${getURL()}api/score-project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.CRON_SECRET
          ? { authorization: `Bearer ${process.env.CRON_SECRET}` }
          : {}),
      },
      body: JSON.stringify({ projectId }),
    })
    if (!res.ok) {
      console.error(`score-project kickoff failed: ${res.status} ${await res.text()}`)
    }
  } catch (error) {
    console.error('score-project kickoff failed:', error)
  }
}
