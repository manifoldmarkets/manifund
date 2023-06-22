import Projects from './projects/page'

export const revalidate = 60

export default function Home() {
  // @ts-expect-error Server Component
  return <Projects />
}
