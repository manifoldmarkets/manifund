import Link from 'next/link'

export default function Default(props: { params: { slug: string } }) {
  const { params } = props
  return (
    <div>
      <h1>Project Defaults</h1>
    </div>
  )
}
