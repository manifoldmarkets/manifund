export function RoundTag(props: { round: string }) {
  const { round } = props
  switch (round) {
    case 'ACX Mini-Grants':
      return (
        <p className="inline-flex rounded-full bg-indigo-100 px-2 text-xs font-semibold leading-5 text-indigo-800">
          ACX Mini-Grants
        </p>
      )
    default:
      return (
        <p className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
          Independent
        </p>
      )
  }
}
