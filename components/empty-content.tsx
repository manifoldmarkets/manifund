import { Row } from './layout/row'

export function EmptyContent(props: {
  link?: string
  onClick?: () => void
  icon: JSX.Element
  title?: string
  subtitle: string
}) {
  const { link, onClick, icon, title, subtitle } = props
  const content = (
    <>
      <Row className="justify-center">{icon}</Row>
      {title && (
        <span className="mt-2 block font-semibold text-gray-900">{title}</span>
      )}
      <span className="block text-sm text-gray-500">{subtitle}</span>
    </>
  )
  if (link) {
    return (
      <a
        href={link}
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        {content}
      </a>
    )
  } else if (onClick) {
    return (
      <button
        type="button"
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        onClick={onClick}
      >
        {content}
      </button>
    )
  }
  return (
    <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      {content}
    </div>
  )
}
