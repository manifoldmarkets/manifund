export default function FundPage(props: { params: { fundSlug: string } }) {
  const { fundSlug } = props.params
  return <div>fund {fundSlug}</div>
}
