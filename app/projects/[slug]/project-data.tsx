import { Project } from '@/db/project'
import { formatMoneyPrecise } from '@/utils/formatting'
import { Stat } from '@/components/stat'
import clsx from 'clsx'

export function ProjectData(props: {
  project: Project
  raised: number
  valuation: number
  minimum: number
}) {
  const { project, raised, valuation, minimum } = props
  return (
    <div
      className={clsx(
        'mt-2',
        project.type === 'cert' && ['draft', 'proposal'].includes(project.stage)
          ? 'grid grid-cols-2 gap-y-5 lg:flex lg:justify-between'
          : 'flex justify-between'
      )}
    >
      <Stat value={formatMoneyPrecise(raised)} label="raised" />
      {['draft', 'proposal'].includes(project.stage) && (
        <Stat value={formatMoneyPrecise(minimum)} label="minimum funding" />
      )}
      {['draft', 'proposal', 'active'].includes(project.stage) && (
        <Stat
          value={formatMoneyPrecise(project.funding_goal)}
          label="funding goal"
        />
      )}
      {project.type === 'cert' && (
        <Stat
          value={formatMoneyPrecise(valuation)}
          label={
            ['draft', 'proposal'].includes(project.stage)
              ? 'minimum valuation'
              : 'valuation'
          }
        />
      )}
    </div>
  )
}
