import Projects from './projects/page'

export const revalidate = 60

export default function Home(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // @ts-expect-error Server Component
  return <Projects searchParams={props.searchParams} />
}
