export function HoldingsBox(props: { label: string; holdings: number }) {
  const { label, holdings } = props
  return (
    <div className="relative bottom-1 flex flex-col rounded bg-orange-100 px-3 pt-1 pb-0 text-center">
      <div className="text-md text-orange-500">{label}</div>
      <div className=" relative bottom-1 m-auto flex text-xl font-bold text-orange-500">
        <p>{holdings}</p>%
      </div>
    </div>
  )
}
