import Projects from './projects/page'

export const revalidate = 60

export default function Home(props: {
  // searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    // @ts-expect-error Server Component
    <Projects
    // searchParams={props.searchParams}
    />
  )
}
