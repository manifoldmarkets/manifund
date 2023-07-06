export function ProgressBar(props: { percent: number }) {
  const { percent } = props
  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        style={{
          background: '#f97316',
          width: `${Math.min(percent, 100)}%`,
          height: '0.5rem',
          borderRadius: '0.5rem',
        }}
      ></div>
    </div>
  )
}
