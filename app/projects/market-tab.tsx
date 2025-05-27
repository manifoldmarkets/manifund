'use client'

import { Button } from '@/components/button'
import { EmptyContent } from '@/components/empty-content'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Profile } from '@/db/profile'
import { FullProject } from '@/db/project'
import { FolderPlusIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/db/supabase-browser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function MarketTab(props: {
  project: FullProject
  userProfile?: Profile
}) {
  const { project, userProfile } = props
  const markets = (props.project.markets || []) as string[]
  const [editing, setEditing] = useState(false)
  return editing ? (
    <EditMarkets project={project} markets={markets} setEditing={setEditing} />
  ) : (
    <Col className="gap-4">
      {markets.map((market, i) => (
        <iframe key={i} className="h-96 w-full" src={market}></iframe>
      ))}
      {/* Button to add a market */}
      {/* TODO: Allow admins (or anyone?) to add markets too! */}
      {userProfile?.id === project.creator && (
        <EmptyContent
          icon={<FolderPlusIcon className="mx-auto h-12 w-12 text-gray-400" />}
          subtitle="Add prediction markets about this project"
          onClick={() => setEditing(!editing)}
        />
      )}
      {markets.length == 0 && (
        <div className="text-center text-gray-500">
          No prediction markets added yet
        </div>
      )}
    </Col>
  )
}

async function updateMarkets(projectId: string, markets: string[]) {
  const supabase = createClient()
  await supabase.from('projects').update({ markets }).eq('id', projectId)
}

function EditMarkets(props: {
  project: FullProject
  markets: string[]
  setEditing: (b: boolean) => void
}) {
  const router = useRouter()
  const { project, setEditing } = props
  const [markets, setMarkets] = useState([...props.markets, ''])
  // Show one input above each market, with a delete button, and a button to add extra inputs
  return (
    <Col className="gap-4">
      <div className="font-light italic text-gray-600">
        Link to predictions about this project; e.g. here&apos;s{' '}
        <Link
          className="text-orange-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          href={createManifoldUrl(project)}
        >
          a template
        </Link>
        .
      </div>

      {markets.map((market, i) => (
        <Col key={i} className="gap-4">
          <Row className="flex gap-4">
            <Input
              type="text"
              placeholder="e.g. https://manifold.markets/Austin/will-taco-tuesday-charity-dinner"
              value={market}
              onChange={(e) => {
                const newMarkets = [...markets]
                newMarkets[i] = e.target.value
                setMarkets(newMarkets)
              }}
              className="flex-grow"
            />
            <Button
              onClick={() => {
                const newMarkets = [...markets]
                newMarkets.splice(i, 1)
                setMarkets(newMarkets)
              }}
            >
              Delete
            </Button>
          </Row>
          {market && <iframe className="h-96 w-full" src={market}></iframe>}
        </Col>
      ))}
      <Row className="gap-4">
        <Button color="gray" onClick={() => setMarkets([...markets, ''])}>
          Another link
        </Button>
        <Button
          onClick={async () => {
            // Remove empty markets
            const newMarkets = markets.filter((m) => m)
            await updateMarkets(project.id, newMarkets)
            setEditing(false)
            // Refresh the page with nextjs
            router.refresh()
          }}
        >
          Save predictions
        </Button>
      </Row>
    </Col>
  )
}

function createManifoldUrl(project: FullProject) {
  const createLink = `https://manifold.markets/create?params=%7B%22q%22%3A%22Will%20the%20Manifund%20project%20%5C%22testname%5C%22...%22%2C%22closeTime%22%3A1735718340000%2C%22description%22%3A%22%7B%5C%22type%5C%22%3A%5C%22doc%5C%22%2C%5C%22content%5C%22%3A%5B%7B%5C%22attrs%5C%22%3A%7B%5C%22level%5C%22%3A3%7D%2C%5C%22content%5C%22%3A%5B%7B%5C%22type%5C%22%3A%5C%22text%5C%22%2C%5C%22marks%5C%22%3A%5B%7B%5C%22type%5C%22%3A%5C%22bold%5C%22%7D%5D%2C%5C%22text%5C%22%3A%5C%22Project%20summary%5C%22%7D%5D%2C%5C%22type%5C%22%3A%5C%22heading%5C%22%7D%2C%7B%5C%22content%5C%22%3A%5B%7B%5C%22type%5C%22%3A%5C%22text%5C%22%2C%5C%22text%5C%22%3A%5C%22testsummary%5C%22%7D%5D%2C%5C%22type%5C%22%3A%5C%22paragraph%5C%22%7D%2C%7B%5C%22type%5C%22%3A%5C%22paragraph%5C%22%7D%2C%7B%5C%22type%5C%22%3A%5C%22paragraph%5C%22%2C%5C%22content%5C%22%3A%5B%7B%5C%22type%5C%22%3A%5C%22text%5C%22%2C%5C%22text%5C%22%3A%5C%22See%20more%20at%20%5C%22%7D%2C%7B%5C%22type%5C%22%3A%5C%22text%5C%22%2C%5C%22marks%5C%22%3A%5B%7B%5C%22attrs%5C%22%3A%7B%5C%22target%5C%22%3A%5C%22_blank%5C%22%2C%5C%22href%5C%22%3A%5C%22testlink%5C%22%7D%2C%5C%22type%5C%22%3A%5C%22link%5C%22%7D%5D%2C%5C%22text%5C%22%3A%5C%22testlink%5C%22%7D%5D%7D%5D%7D%22%2C%22outcomeType%22%3A%22MULTIPLE_CHOICE%22%2C%22visibility%22%3A%22public%22%2C%22answers%22%3A%5B%22Hit%20its%20minimum%20funding%20bar%20of%20%241k%3F%22%2C%22Successfully%20achieve%20its%20aims%3F%22%2C%22Raise%20%241k%2B%20from%20other%20funders%20this%20year%3F%22%5D%2C%22addAnswersMode%22%3A%22ANYONE%22%2C%22shouldAnswersSumToOne%22%3Afalse%7D`
  // Replace testname, 1k, testsummary, testlink with actual project data (urlencoded)
  const url = createLink
    .replace('testname', encodeURIComponent(project.title))
    .replaceAll('1k', encodeURIComponent(project.min_funding.toString()))
    // TODO: Could pull out the first paragraph of the project description, but need to de-Tiptapify it
    .replace('testsummary', encodeURIComponent('...'))
    .replaceAll(
      'testlink',
      encodeURIComponent(`https://manifund.org/projects/${project.slug}`)
    )
  return url
}

// JSON format for the `markets` column in the project table:
/**
 * [
 * "https://dev.manifold.markets/Austin/will-taco-tuesday-charity-dinner-8f0be75719eb",
 * "https://dev.manifold.markets/Austin/will-taco-tuesday-charity-dinner-ha"
 * ]
 */
// (it's just a string array of embeddable URLs, but we chose json in case we want to add more data later)
