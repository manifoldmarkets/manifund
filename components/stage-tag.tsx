import {
  EllipsisHorizontalCircleIcon,
  SunIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Row } from './layout/row'
export function StageTag(props: { projectStage: string }) {
  const { projectStage } = props
  switch (projectStage) {
    case 'proposal':
      return (
        <Row className="gap-1 rounded-full bg-orange-100 px-2 pt-1  text-center">
          <EllipsisHorizontalCircleIcon className="relative bottom-0.5 m-auto h-6 w-6 text-orange-500" />
          <div className="text-md relative bottom-0.5 text-orange-500">
            proposal
          </div>
        </Row>
      )
    case 'active':
      return (
        <Row className="gap-1 rounded-full bg-green-100 px-2 pt-1  text-center">
          <SunIcon className="relative bottom-0.5 m-auto h-6 w-6 text-green-500" />
          <div className="text-md relative bottom-0.5 text-green-500">
            active
          </div>
        </Row>
      )
    case 'not funded':
      return (
        <Row className="gap-1 rounded-full bg-red-100 px-2 pt-1  text-center">
          <XCircleIcon className="relative bottom-0.5 m-auto h-6 w-6 text-red-500" />
          <div className="text-md relative bottom-0.5 text-red-500">
            not funded
          </div>
        </Row>
      )
    case 'completed':
      return (
        <Row className="gap-1 rounded-full bg-blue-100 px-2 py-1  text-center">
          <CheckCircleIcon className="rm-auto relative bottom-0.5 h-6 w-6 text-blue-500" />
          <div className="text-md relative bottom-0.5 text-blue-500">
            completed
          </div>
        </Row>
      )
    default:
      return null
  }
}
