'use client'
import { useEffect, useState } from 'react'

const isServer = typeof window === 'undefined'

// Like useState, but first checks for a JSON object stored under the key in the browser's localStorage
// If key is not set, does nothing.
const useLocalStorage = <type>(initialValue: type, key?: string) => {
  const [value, setValue] = useState<type>(initialValue)

  const initialize = () => {
    if (isServer) {
      return initialValue
    }
    try {
      const initialValueString = JSON.stringify(initialValue)
      const value = key ? window.localStorage.getItem(key) : initialValueString
      return value ? JSON.parse(value) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  }

  useEffect(() => {
    if (!isServer) {
      setValue(initialize())
    }
  }, [])

  const saveValue = (value: type) => {
    try {
      setValue(value)
      if (typeof window !== 'undefined' && key) {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.log(error)
    }
  }
  return { value: value, saveValue }
}

export function clearLocalStorageItem(key: string) {
  window.localStorage.removeItem(key)
}

export default useLocalStorage
