'use client'
import { useState } from 'react'

export function Button(props: { count: number; onClick: () => void }) {
  const { count, onClick } = props

  return (
    <button className="bg-rose-400 text-white rounded p-2" onClick={onClick}>
      Clicked {count} times
    </button>
  )
}
