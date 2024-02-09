export function DividerWithHeader(props: { header: string }) {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-gray-50 px-2 text-gray-500">{props.header}</span>
      </div>
    </div>
  )
}
