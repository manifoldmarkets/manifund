import { createAdminClient } from '@/db/edge'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'

// Emails holders of long-idle withdrawable balances to flag the money hasn't been
// forgotten. Recipients and amounts come from scripts/idle-cash-balances.ts.
//
// Usage:
//   bun run scripts/email-idle-balances.ts --test <email>   # one sample to you
//   bun run scripts/email-idle-balances.ts                  # dry run, prints all
//   bun run scripts/email-idle-balances.ts --execute        # sends for real

const RECIPIENTS = [
  { username: 'Asterisk-Magazine', amount: 70_000 },
  { username: 'Linch', amount: 35_457 },
  { username: 'laurence_ai', amount: 32_000 },
  { username: 'peterwildeford', amount: 10_050 },
]

const SUBJECT = 'Your Manifund balance'
const BUTTON_TEXT = 'View your balance'

const body = (amount: number) =>
  `You're receiving this email because you've had a withdrawable balance of $${amount.toLocaleString(
    'en-US'
  )} on Manifund for at least a year. Of course, you're welcome to leave it on the platform, but just flagging to make sure the money hasn't been forgotten. Thank you!`

const testIndex = process.argv.indexOf('--test')
const TEST_EMAIL = testIndex !== -1 ? process.argv[testIndex + 1] : undefined
const EXECUTE = process.argv.includes('--execute')

async function main() {
  const supabase = createAdminClient()

  const targets = []
  for (const r of RECIPIENTS) {
    const { data: p } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .eq('username', r.username)
      .single()
      .throwOnError()
    targets.push({ ...p, amount: r.amount })
  }

  if (TEST_EMAIL) {
    // Send one sample — rendered exactly as the first recipient's would be.
    const sample = targets[0]
    const model = {
      notifText: body(sample.amount),
      buttonUrl: `https://manifund.org/${sample.username}`,
      buttonText: BUTTON_TEXT,
      subject: SUBJECT,
    }
    console.log(`TEST -> ${TEST_EMAIL} (rendered as @${sample.username}'s copy)`)
    console.log(JSON.stringify(model, null, 2))
    await sendTemplateEmail(TEMPLATE_IDS.GENERIC_NOTIF, model, undefined, TEST_EMAIL)
    return
  }

  for (const t of targets) {
    const model = {
      notifText: body(t.amount),
      buttonUrl: `https://manifund.org/${t.username}`,
      buttonText: BUTTON_TEXT,
      subject: SUBJECT,
    }
    if (!EXECUTE) {
      console.log(`\nDRY RUN -> ${t.full_name} (@${t.username})`)
      console.log(model.notifText)
      console.log(`[${model.buttonText}] ${model.buttonUrl}`)
      continue
    }
    console.log(`Sending -> ${t.full_name} (@${t.username}) $${t.amount.toLocaleString()}`)
    await sendTemplateEmail(TEMPLATE_IDS.GENERIC_NOTIF, model, t.id)
  }
  if (!EXECUTE) console.log('\nRe-run with --execute to send.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
