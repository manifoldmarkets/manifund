import { getUser, isAdmin } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import NoAccess from '../no-access'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  if (!user || !isAdmin(user)) {
    return <NoAccess />
  }

  const tabs = [
    { name: 'Users', path: '/admin' },
    { name: 'Pending Approval', path: '/admin/approvals' },
    { name: 'Transactions', path: '/admin/transactions' },
    { name: 'Projects', path: '/admin/projects' },
    { name: 'Tools', path: '/admin/tools' },
  ]

  return (
    <div>
      <div className="rounded-bl-lg rounded-br-lg bg-gradient-to-r from-orange-500 to-rose-500 px-0 py-4 hover:shadow-lg sm:px-8">
        <h1 className="text-center text-3xl font-semibold text-white">
          Admin Panel
        </h1>
      </div>

      <nav className="border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className="border-b-2 border-transparent px-3 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4">{children}</div>
    </div>
  )
}
