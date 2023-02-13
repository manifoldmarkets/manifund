// import { Button } from './button'
import ServerComponent from './test-server-component'
import { Login } from '@/components/login'
import { Auth } from '@supabase/auth-ui-react'
import { useSupabase } from '@/components/supabase-provider'

export default function Home() {
  const { supabase } = useSupabase()

  return (
    <div className="text-blue-500">
      Hello world!
      {/* <Button /> */}
      <Login />
      <Auth supabaseClient={supabase} />
      {/* Async components cause a Typescript error, see https://github.com/vercel/next.js/issues/42292 */}
      {/* @ts-expect-error Server Component */}
      <ServerComponent />
    </div>
  )
}
