'use client'
import React from 'react'
import Router, { useRouter } from 'next/navigation'
import { useUser } from '@/utils/hooks/use-user'

export default function Sidebar() {
  // props: {
  //   className?: string
  //   logoSubheading?: string
  //   isMobile?: boolean
  // }
  //   const { className, logoSubheading, isMobile } = props
  //   const router = useRouter()
  //   const currentPage = router.pathname

  const user = useUser()

  const navOptions = [{ name: 'Home', href: '/' }]

  return (
    <div className="sticky top-0 hidden divide-gray-300 self-start pl-2 lg:col-span-2 lg:flex">
      <nav aria-label="Sidebar" className="flex h-screen flex-col">
        <div>logo</div>
        <div className="height-6" />

        {user === undefined && <div className="h-[56px]" />}
        {user === null && <a href="/test">Login</a>}

        {user && <div>Profile Summary</div>}
        {user && <a href="/edit-profile">Edit Profile</a>}

        <div className="flex flex-col gap-1">
          {navOptions.map((item) => (
            <a href={item.href}>{item.name}</a>
          ))}

          <p>Create Impact Certificate</p>
        </div>
      </nav>
    </div>
  )
}
