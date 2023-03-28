import clsx from 'clsx'
import { useRouter } from 'next/navigation'

export type Tab = {
  name: string
  href: string
  count: number
  current: boolean
  display: JSX.Element
}
export function Tabs(props: { tabs: Tab[]; preTabSlug?: string }) {
  const { tabs, preTabSlug } = props
  const router = useRouter()
  return (
    <div>
      <div className="block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  router.replace(`${preTabSlug}${tab.href}`)
                }}
                className={clsx(
                  tab.current
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                  'flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={tab.current ? 'page' : undefined}
              >
                {tab.name}
                {tab.count > 0 ? (
                  <span
                    className={clsx(
                      tab.current
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-900',
                      'ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block'
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="py-6">{tabs.filter((tab) => tab.current)[0].display}</div>
    </div>
  )
}
