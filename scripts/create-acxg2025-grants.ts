import { createAdminClient } from '@/pages/api/_db'
import { ACXG_2025_GRANTS } from './acxg2025-grants'
import { Project, TOTAL_SHARES } from '@/db/project'
import { projectSlugify } from '@/utils/formatting'
import uuid from 'react-uuid'
import { getProfileById, getProfileByUsername } from '@/db/profile'
import { updateProjectCauses } from '@/db/cause'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { getURL } from '@/utils/constants'

// Sample public project:
/*
  {
    id: 45,
    name: 'Nuño Sempere',
    email: 'nuno.semperelh@protonmail.com',
    projectTitle:
      'Elite cyborg forecasters identify and share the most important signs of global catastrophic risks for you and the public.',
    projectDescription:
      'Here is our funding memo from last year: <https://docs.google.com/document/d/18GWF0pVy5X7M_0e3l49Ze82aqHvVurVpsLm63htmc64/edit?usp=drive_web&ouid=105745069467002633267> since then we have focused more on foresight specifically, and made more emphasis on building automated tooling, essentially due to funder apetite.',
    backgroundQualifications:
      'On the forecasting end: top forecaster, previously cofounded Samotsvety. https://samotsvety.org/ - https://samotsvety.org/track-record/\nOn the institution-building end: I have been able to transition this from an informal project into a 501c3 with a running forecasting team and enough funding for a bit over a year, and similar (but a bit older) people in my peer group (Jaime Sevilla) have been able to build larger organizations without that much difficulty.',
    socialMediaWebsite:
      "x.com/@NunoSempere\nblog.sentinel-team.org\nnunosempere.com/blog\n\nI'm typing off this application relatively quickly, but if you want to have a call, particularly about larger amounts, I'm happy to have a call; you can reach out at nuno.semperelh@protonmail.com",
    fundingAmountRequested:
      "$5K to $1M. Donations in the $5K range add up and soon become real money. At the $50-100K I'd hire an additional programmer/growth marketer/response person. Donations in the range of $1M allow me to have an organization at the level of Epoch or METR.",
    additionalInformation:
      'blog.sentinel-team.org\nhttps://x.com/search?q=from%3A%40SebKrier%20Sentinel&src=typed_query\nhttps://x.com/NeelNanda5/status/1917287979430863241\nhttps://github.com/NunoSempere/eye-of-sauron\nhttps://github.com/NunoSempere/ai-osint-mvp',
    backupPlan:
      "We continue working on this until the end of the year, and we seek alternative funding from the FLF (seems somewhat likely) or Open Philanthropy (seems possible but the process is like pulling a tooth). If neither works then we try to become sustainable via subscriptions or through offering services to hedgefunds. If that doesn't work, we shut down or greatly downsize. Overall I'd model the value of a donation as allowing us to grow faster + increasing runway + increasing likelyhood of surviving sustainable. Which is to say, there is some value of information in seeing what the larger version of Sentinel can look like, but less value of information than for a new project.",
    privacyLevel:
      'Public (I can share your project with evaluators and external funders, and mention it briefly on my blog - for example, to congratulate you if you win. I will avoid mentioning any parts of this form you specifically describe as secret.)',
    locationTimezone: 'No',
    termsAgreement: 'No',
    additionalComments:
      "Sentinel might not work as a public good, in which case we/I might start a related for-profit. But in that case I'd like to start anew. Potential donors should understand that they are donating to the public good version of Sentinel, not to potential for-profit successors.",
    shortTitle: 'Forecasting global disasters',
    minAmount: 50,
  },
*/
// Sample semi-private project:
/*
  {
    id: 608,
    name: 'Alyssia Jovellanos',
    email: 'alyssia.jovellanos@gmail.com',
    projectTitle:
      'An open-source LM arena for epistemic virtues “Epistemics Arena”',
    fundingAmountRequested:
      '$10,000 (if I can get more for compute/model credits that would be great too!) ',
    shortTitle: 'LM arena for epistemic virtue',
    minAmount: 10,
  },
*/

type PublicProject = {
  id: number
  name: string
  email: string
  projectTitle: string
  projectDescription: string
  backgroundQualifications: string
  socialMediaWebsite: string
  fundingAmountRequested: string
  additionalInformation: string
  backupPlan: string
  privacyLevel: string
  locationTimezone: string
  termsAgreement: string
  additionalComments: string
  shortTitle: string
  minAmount: number
}

function h3(text: string) {
  return {
    type: 'heading',
    content: [{ type: 'text', text: text }],
    attrs: {
      level: 3,
    },
  }
}

function p(text: string) {
  return {
    type: 'paragraph',
    content: [{ type: 'text', text: text }],
  }
}

function ps(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(p)
}

// The tiptap should be an alternating series of h3 titles and paragraphs
function publicProjectToTiptap(json: PublicProject) {
  return {
    type: 'doc',
    content: [
      h3('Description of proposed project'),
      ...ps(json.projectDescription),
      h3('Why are you qualified to work on this?'),
      ...ps(json.backgroundQualifications),
      h3('Other links'),
      ...ps(json.additionalInformation),
      h3('What would you do if not funded?'),
      ...ps(json.backupPlan),
      h3('How much money do you need?'),
      ...ps(json.fundingAmountRequested),
      h3('Supporting documents'),
      ...ps(json.additionalInformation),
    ],
  }
}

async function createProject(json: PublicProject) {
  const supabase = createAdminClient()

  // TODO: replace with Scott Alexander for ACX Grants
  // const resp = await supabase.auth.getUser()
  // const regranter = resp.data.user
  // if (!regranter) {
  //   console.error('no regranter')
  // }
  // const regranterProfile = await getProfileById(supabase, regranter.id)
  const regranterProfile = await getProfileByUsername(supabase, 'acx-grants')
  if (!regranterProfile) {
    throw new Error('regranterProfile not found')
  }

  const maybeRecipient = await supabase
    .from('users')
    .select('id')
    .eq('email', json.email.toLowerCase())
    .throwOnError()
  const maybeRecipientId = maybeRecipient.data[0]?.id

  console.log('found recipient?', maybeRecipientId)

  // recipient email and name are only set if recipient doesn't already exist
  const recipientEmail = maybeRecipientId ? undefined : json.email.toLowerCase()
  const recipientName = maybeRecipientId ? undefined : json.name

  const slug = await projectSlugify(json.shortTitle, supabase)
  const recipientProfile = maybeRecipientId
    ? await getProfileById(supabase, maybeRecipientId)
    : null

  const project = {
    id: uuid(),
    creator: recipientProfile ? recipientProfile.id : regranterProfile.id,
    title: json.shortTitle,
    blurb: json.projectTitle,
    description: publicProjectToTiptap(json),
    min_funding: json.minAmount * 1000,
    funding_goal: json.minAmount * 1000 * 2,
    founder_shares: TOTAL_SHARES,
    type: 'grant' as Project['type'],
    // stage: 'proposal' as Project['stage'],
    stage: 'draft' as Project['stage'],
    round: 'Regrants',
    slug,
    approved: null,
    signed_agreement: false,
    location_description: 'TBD',
    lobbying: false,
  }

  const donorContribution = json.minAmount * 1000
  const title = json.shortTitle
  const donorNotes = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Grant from ACX Grants 2025' }],
      },
    ],
  }

  console.log('recipientEmail', recipientEmail)
  console.log('recipientName', recipientName)

  if (recipientEmail && recipientName) {
    const donorComment = {
      id: uuid(),
      project: project.id,
      commenter: regranterProfile.id,
      content: donorNotes,
    }
    const projectTransfer = {
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      project_id: project.id,
    }
    await supabase
      .rpc('create_transfer_grant', {
        project: project,
        donor_comment: donorComment,
        project_transfer: projectTransfer,
        grant_amount: donorContribution,
      })
      .throwOnError()
    const postmarkVars = {
      amount: donorContribution,
      regranterName: regranterProfile.full_name,
      projectTitle: title,
      loginUrl: `${getURL()}login?email=${recipientEmail}`,
    }
    await sendTemplateEmail(
      TEMPLATE_IDS.NEW_USER_GRANT,
      postmarkVars,
      undefined,
      recipientEmail
    )
  } else if (recipientProfile) {
    const donorComment = {
      id: uuid(),
      project: project.id,
      commenter: regranterProfile.id,
      content: donorNotes,
      txn_id: uuid(),
    }
    const donation = {
      project: project.id,
      amount: donorContribution,
      bidder: regranterProfile.id,
    }
    await supabase
      .rpc('give_grant', {
        project: project,
        donor_comment: donorComment,
        donation: donation,
      })
      .throwOnError()
    const postmarkVars = {
      amount: donorContribution,
      regranterName: regranterProfile.full_name,
      projectTitle: title,
      projectUrl: `${getURL()}projects/${slug}`,
    }
    await sendTemplateEmail(
      TEMPLATE_IDS.EXISTING_USER_GRANT,
      postmarkVars,
      recipientProfile.id
    )
  } else {
    console.error('invalid inputs 2')
    throw new Error()
  }

  await updateProjectCauses(supabase, ['acx-grants-2025'], project.id)

  console.log('project created', project.title, project.slug)
}

export async function createAcxg2025Grants() {
  const toSkipIds = [271, 450]
  for (const grant of ACXG_2025_GRANTS.slice(2, 3)) {
    if (toSkipIds.includes(grant.id)) {
      console.log('skipping grant', grant.id)
      continue
    }
    await createProject(grant as PublicProject)
  }
}

function main() {
  createAcxg2025Grants().catch((error) => {
    console.error('Failed to create ACX Grants 2025 grants:', error)
  })
}
main()
