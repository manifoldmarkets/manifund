import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import {
  CurrencyDollarIcon,
  PlusSmallIcon,
  MinusSmallIcon,
} from '@heroicons/react/24/solid'

export function BalanceBox(props: { balance: number }) {
  const { balance } = props
  return (
    <Row className="h-fit gap-1">
      <Col className="my-2 justify-between">
        <a
          href="https://airtable.com/shrIB5yGc56DoQBhJ"
          className="rounded bg-gray-200 p-1"
        >
          <Tooltip text="Add funds">
            <PlusSmallIcon className="h-4 w-4 text-gray-500" />
          </Tooltip>
        </a>
        <a
          href="https://airtable.com/shrI3XFPivduhbnGa"
          className="rounded bg-gray-200 p-1"
        >
          <Tooltip text="Withdraw funds">
            <MinusSmallIcon className="h-4 w-4 text-gray-500" />
          </Tooltip>
        </a>
      </Col>
      <Col className="flex rounded bg-gray-200 py-2 px-3 text-center">
        <div className="text-md text-gray-500">Balance</div>
        <div className=" flex text-2xl font-bold text-gray-500">
          <CurrencyDollarIcon className="h-8 w-8" />
          <p>{balance}</p>
        </div>
      </Col>
    </Row>
  )
}
