import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid'

export default function AlertBox(props: {
  title?: string
  type?: 'error' | 'warning' | 'info' | 'success'
  children?: React.ReactNode
}) {
  const { title, children } = props
  const type = props.type ?? 'warning'
  const color = {
    error: 'red',
    warning: 'yellow',
    info: 'blue',
    success: 'green',
  }[type]
  const Icon = {
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    success: CheckCircleIcon,
  }[type]

  // Generate each full class name as a string literal for the Tailwind compiler
  const unusedLiterals = [
    'bg-red-50 text-red-400 text-red-700 text-red-800',
    'bg-yellow-50 text-yellow-400 text-yellow-700 text-yellow-800',
    'bg-blue-50 text-blue-400 text-blue-700 text-blue-800',
    'bg-green-50 text-green-400 text-green-700 text-green-800',
  ]

  return (
    <div className={`bg-${color}-50 rounded-md p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 text-${color}-400`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className={`text-${color}-800 text-sm font-medium`}>{title}</h3>
          {children && <div className={`mt-2 text-sm text-${color}-700`}>{children}</div>}
        </div>
      </div>
    </div>
  )
}
