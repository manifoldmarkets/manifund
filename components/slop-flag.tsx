import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { Tooltip } from './tooltip'
import { Row } from './layout/row'
import { isLikelyAiWritten } from '@/utils/slop'

// Warning icon shown on project cards when Pangram flags the text as AI-written
export function AiWrittenIcon(props: { aiFraction: number | null }) {
  const { aiFraction } = props
  if (!isLikelyAiWritten(aiFraction)) return null
  return (
    <Tooltip
      text={`Pangram flags ${Math.round((aiFraction ?? 0) * 100)}% of this text as AI-written`}
    >
      <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
    </Tooltip>
  )
}

// Banner + quality score shown at the top of the project page
export function ProjectScoreFlags(props: {
  aiFraction: number | null
  qualityScore: number | null
}) {
  const { aiFraction, qualityScore } = props
  const flagged = isLikelyAiWritten(aiFraction)
  if (!flagged && qualityScore == null) return null
  return (
    <div className="mb-2">
      {flagged && (
        <div className="rounded-md bg-amber-50 p-3 ring-1 ring-inset ring-amber-200">
          <Row className="items-start gap-2">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-sm text-amber-800">
              <span className="font-semibold">Likely AI-generated.</span> Pangram flags{' '}
              {Math.round((aiFraction ?? 0) * 100)}% of this text as AI-written.
            </div>
          </Row>
        </div>
      )}
    </div>
  )
}
