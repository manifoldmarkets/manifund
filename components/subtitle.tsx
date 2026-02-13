import clsx from 'clsx'

export function Subtitle(props: { children: string; className?: string }) {
  const { children: text, className } = props
  return (
    <h2 className={clsx('text-bold mb-2 inline-block text-xl text-gray-500', className)}>{text}</h2>
  )
}
