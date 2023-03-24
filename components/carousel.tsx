import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { throttle } from 'lodash'
import { ReactNode, useRef, useState, useEffect } from 'react'
import { Row } from './layout/row'

export function Carousel(props: {
  children: ReactNode
  theme?: string
  className?: string
}) {
  const { children, theme, className } = props

  const ref = useRef<HTMLDivElement>(null)

  const th = (f: () => any) => throttle(f, 500, { trailing: false })
  const scrollLeft = th(() =>
    ref.current?.scrollBy({ left: -ref.current.clientWidth })
  )
  const scrollRight = th(() =>
    ref.current?.scrollBy({ left: ref.current.clientWidth })
  )

  const [atFront, setAtFront] = useState(true)
  const [atBack, setAtBack] = useState(false)
  const onScroll = throttle(() => {
    if (ref.current) {
      const { scrollLeft, clientWidth, scrollWidth } = ref.current
      setAtFront(scrollLeft < 80)
      setAtBack(scrollWidth - (clientWidth + scrollLeft) < 80)
    }
  }, 500)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onScroll, [children])

  return (
    <div className={clsx('flex justify-between', className)}>
      <div
        className="relative right-2 flex w-10 cursor-pointer items-center justify-center"
        onMouseDown={scrollLeft}
      >
        <ChevronLeftIcon
          className={clsx(
            'h-8 w-8 rounded-full p-1 transition-transform duration-200 hover:-translate-x-1',
            theme
              ? `bg-${theme}-200 text-${theme}-700`
              : 'bg-orange-200 text-orange-700'
          )}
        />
      </div>
      <Row
        className="w-full snap-x gap-3 overflow-x-auto scroll-smooth rounded-md py-3 scrollbar-hide"
        ref={ref}
        onScroll={onScroll}
      >
        {children}
      </Row>
      <div
        className="relative left-2 flex w-10 cursor-pointer items-center justify-center"
        onMouseDown={scrollRight}
      >
        <ChevronRightIcon
          className={clsx(
            'h-8 w-8 rounded-full p-1 transition-transform duration-200 hover:translate-x-1',
            theme
              ? `bg-${theme}-200 text-${theme}-700`
              : 'bg-orange-200 text-orange-700'
          )}
        />
      </div>
    </div>
  )
}
