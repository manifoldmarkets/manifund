import clsx from 'clsx'

// Color is a hex code
export function RightCarrotIcon(props: { className?: string; size?: number }) {
  const { className, size = 16 } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className={clsx('bi bi-caret-right-fill', className)}
      viewBox="0 0 16 16"
    >
      <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
    </svg>
  )
}
