'use client'
import { useState } from 'react'

export function Button() {
  const [count, setCount] = useState(0)

  return (
    <button
      className="bg-rose-400 text-white rounded p-2"
      onClick={() => {
        setCount(count + 1)
      }}
    >
      Clicked {count} times
    </button>
  )
}
