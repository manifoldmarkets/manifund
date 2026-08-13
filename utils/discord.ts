export async function sendDiscordAlert(message: string) {
  const webhookUrl = process.env.DISCORD_ALERTS_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('DISCORD_ALERTS_WEBHOOK_URL not set; skipping alert:', message)
    return
  }
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    })
  } catch (e) {
    console.error('Failed to send Discord alert', e)
  }
}
