import React from 'react'

export default function ApiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex h-screen w-screen flex-col overflow-auto bg-gray-50">
      {children}
    </div>
  )
}
