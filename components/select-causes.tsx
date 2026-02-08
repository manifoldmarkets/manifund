import { MiniCause } from '@/db/cause'
import clsx from 'clsx'
import { Row } from './layout/row'
import { Col } from './layout/col'
import { CauseTag } from './tags'

const MAX_CAUSES = 3

export function SelectCauses(props: {
  causesList: MiniCause[]
  selectedCauses: MiniCause[]
  setSelectedCauses: (causes: MiniCause[]) => void
}) {
  const { causesList, selectedCauses, setSelectedCauses } = props
  const atLimit = selectedCauses.length >= MAX_CAUSES
  return (
    <Col className="gap-1">
      <Row className="flex-wrap gap-1">
        {causesList.map((cause) => {
          const causeIncluded = !!selectedCauses.find(
            (c) => c.slug === cause.slug
          )
          const disabled = !causeIncluded && atLimit
          return (
            <button
              onClick={() => {
                if (disabled) return
                if (causeIncluded) {
                  setSelectedCauses(
                    selectedCauses.filter((t) => t.slug !== cause.slug)
                  )
                } else {
                  setSelectedCauses([...selectedCauses, cause])
                }
              }}
              key={cause.slug}
              disabled={disabled}
            >
              <CauseTag
                causeTitle={cause.title}
                causeSlug={cause.slug}
                noLink
                className={clsx(
                  '!sm:text-sm !p-3',
                  causeIncluded
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                )}
              />
            </button>
          )
        })}
      </Row>
      {atLimit && (
        <p className="text-sm text-gray-500">
          Maximum of {MAX_CAUSES} cause areas selected.
        </p>
      )}
    </Col>
  )
}
