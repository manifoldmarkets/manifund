import Projects from './projects/page'

export const revalidate = 60
// export const dynamic = 'force-static'

export default function Home() {
  // @ts-expect-error Server Component
  return <Projects />
}
