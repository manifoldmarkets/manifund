import Projects from './projects/page'

export const revalidate = 60

export default async function Home(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  return <Projects searchParams={props.searchParams} />;
}
