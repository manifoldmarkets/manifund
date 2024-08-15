import { MiniCause } from '@/db/cause'
import clsx from 'clsx'
import { Row } from './layout/row'
import { CauseTag } from './tags'

export function SelectCauses(props: {
  causesList: MiniCause[]
  selectedCauses: MiniCause[]
  setSelectedCauses: (causes: MiniCause[]) => void
}) {
  const { causesList, selectedCauses, setSelectedCauses } = props
  return (
    <Row className="flex-wrap gap-1">
      {causesList.map((cause) => {
        const causeIncluded = !!selectedCauses.find(
          (c) => c.slug === cause.slug
        )
        return (
          <button
            onClick={() => {
              if (causeIncluded) {
                setSelectedCauses(
                  selectedCauses.filter((t) => t.slug !== cause.slug)
                )
              } else {
                setSelectedCauses([...selectedCauses, cause])
              }
            }}
            key={cause.slug}
          >
            <CauseTag
              causeTitle={cause.title}
              causeSlug={cause.slug}
              noLink
              className={clsx(
                '!sm:text-sm !p-3',
                causeIncluded
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              )}
            />
          </button>
        )
      })}
    </Row>
  )
}
