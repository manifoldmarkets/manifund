import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { throttle } from 'lodash'
import { ReactNode, useRef, useState, useEffect } from 'react'
import { Row } from './layout/row'
import { VisibilityObserver } from './visibility-observer'

export function Carousel(props: {
  children: ReactNode
  loadMore?: () => void
  className?: string
}) {
  const { children, loadMore, className } = props

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
        <ChevronLeftIcon className="h-8 w-8 rounded-full bg-orange-100 p-1 text-orange-600" />
      </div>
      <Row
        className="scrollbar-hide w-full snap-x gap-4 overflow-x-auto scroll-smooth rounded-md py-3 px-3"
        ref={ref}
        onScroll={onScroll}
      >
        {children}

        {loadMore && (
          <VisibilityObserver
            className="relative -left-96"
            onVisibilityUpdated={(visible) => visible && loadMore()}
          />
        )}
      </Row>
      <div
        className="relative left-2 flex w-10 cursor-pointer items-center justify-center"
        onMouseDown={scrollRight}
      >
        <ChevronRightIcon className="h-8 w-8 rounded-full bg-orange-100 p-1 text-orange-600" />
      </div>
    </div>
  )
}
