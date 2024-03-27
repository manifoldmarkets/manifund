import { Popover } from '@headlessui/react'
import { FaceSmileIcon } from '@heroicons/react/24/outline'
import { Row } from './layout/row'

export const freeReactions = [
  '➕',
  '➖',
  '🤔',
  '😮',
  '🥳',
  '💡',
  '❓',
  '🔥',
  '👏',
  '🌈',
]

export const paidReactions = {
  '🧡': 1,
  '🏅': 10,
  '🏆': 100,
}

const AddReactionIcon = () => (
  <div className="relative w-5">
    <FaceSmileIcon className="h-5 w-5" />
    <div className="absolute right-0 top-0 rounded-full bg-white px-[0.5px] text-[10px] leading-[10px]">
      +
    </div>
  </div>
)

export function AddRxn() {
  return (
    <Popover className="relative">
      <Popover.Button className="text-gray-500 hover:text-gray-700 focus:outline-0">
        <AddReactionIcon />
      </Popover.Button>

      <Popover.Panel className="absolute bottom-5 left-5 z-10 rounded-md rounded-bl-sm bg-white p-3 shadow-md">
        <h3 className="text-sm text-gray-700">Free reactions</h3>
        <div className="grid grid-cols-5 gap-2">
          {freeReactions.map((reaction) => (
            <Popover.Button key={reaction} className="text-base">
              <div className="rounded px-1 py-0.5 text-base hover:bg-gray-200">
                {reaction}
              </div>
            </Popover.Button>
          ))}
        </div>
        <h3 className="mt-4 text-sm text-gray-700">Tipped reactions</h3>
        <Row className="justify-between gap-2">
          {Object.keys(paidReactions).map((reaction) => (
            <Popover.Button key={reaction}>
              <Row className="items-center gap-0.5 rounded px-1 py-0.5 hover:bg-gray-200">
                <span className="text-sm text-gray-700">
                  ${paidReactions[reaction]}:
                </span>
                <span className="text-base">{reaction}</span>
              </Row>
            </Popover.Button>
          ))}
        </Row>
      </Popover.Panel>
    </Popover>
  )
}

export function FreeReactionDisplay(props: { reaction: string }) {
  return (
    <div className="rounded px-1 py-0.5 text-base hover:bg-gray-200">
      {props.reaction}
    </div>
  )
}
