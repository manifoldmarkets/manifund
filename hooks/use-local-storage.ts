'use client'
import { useEffect, useState } from 'react'

const isServer = typeof window === 'undefined'

// Like useState, but first checks for a JSON object stored under the key in the browser's localStorage
// If key is not set, does nothing.
const useLocalStorage = <type>(initialValue: type, key?: string) => {
  const [state, setState] = useState<type>(initialValue)

  const initialize = () => {
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

  const setValue = (value: type) => {
    try {
      setState(value)
      if (typeof window !== 'undefined' && key) {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.log(error)
    }
  }
  return { value: state, setValue }
}

export function clearLocalStorageItem(key: string) {
  window.localStorage.removeItem(key)
}

export default useLocalStorage
