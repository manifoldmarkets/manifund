import { Table } from '@/components/table'
import { getUser, isAdmin } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { createAdminClient } from '@/pages/api/_db'

export default async function Admin() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user || !isAdmin(user)) {
    return <div>Not authorized</div>
  }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin.from('users').select('*')
  const users = data as { id: string; email: string }[]
  return (
    <div>
      <h1>Admin</h1>
      <Table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Id</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.id}</td>
              <td>TODO</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
