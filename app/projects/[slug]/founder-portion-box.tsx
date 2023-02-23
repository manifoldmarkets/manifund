export function FounderPortionBox(props: { founderPortion: number }) {
  const { founderPortion } = props
  return (
    <div className="relative bottom-1 flex flex-col rounded bg-orange-100 px-3 pt-2 pb-1 text-center">
      <div className="text-md text-orange-500">Founder Holds</div>
      <div className=" relative bottom-1 m-auto flex text-xl font-bold text-orange-500">
        <p>{founderPortion}</p>%
      </div>
    </div>
  )
}
