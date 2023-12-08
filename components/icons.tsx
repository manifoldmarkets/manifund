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

export function ManifoldIcon(props: { className?: string; size?: number }) {
  const { className, size = 16 } = props
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M5.24854 17.0952L18.7175 6.80301L14.3444 20M5.24854 17.0952L9.79649 18.5476M5.24854 17.0952L4.27398 6.52755M14.3444 20L9.79649 18.5476M14.3444 20L22 12.638L16.3935 13.8147M9.79649 18.5476L12.3953 15.0668M4.27398 6.52755L10.0714 13.389M4.27398 6.52755L2 9.0818L4.47389 8.85643M12.9451 11.1603L10.971 5L8.65369 11.6611"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
