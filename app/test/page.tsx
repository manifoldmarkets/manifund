import { Button } from './button'
import ServerComponent from './test-server-component'

export default function Home() {
  return (
    <div className="text-blue-500">
      Hello world!
      <Button />
      {/* Async components cause a Typescript error, see https://github.com/vercel/next.js/issues/42292 */}
      {/* @ts-expect-error Server Component */}
      <ServerComponent />
    </div>
  )
}
