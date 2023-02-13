import ServerComponent from './test-server-component'
import Auth from '@/app/auth-ui'

export default function Home() {
  return (
    <div className="text-blue-500">
      Hello world!
      <Auth />
      {/* <Button /> */}
      {/* Async components cause a Typescript error, see https://github.com/vercel/next.js/issues/42292 */}
      {/* @ts-expect-error Server Component */}
      <ServerComponent />
    </div>
  )
}
