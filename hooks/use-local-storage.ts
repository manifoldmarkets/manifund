'use client'
import { useState } from 'react'

// Like useState, but first checks for a JSON object stored under the key in the browser's localStorage
// If key is not set, does nothing.
const useLocalStorage = <type>(initialValue: type, key?: string) => {
  const [state, setState] = useState(() => {
    try {
      const initialValueString = JSON.stringify(initialValue)
      const value = key ? window.localStorage.getItem(key) : initialValueString
      return value ? JSON.parse(value) : initialValue
    } catch (error) {
      console.log(error)
    }
  })

  const setValue = (value: type) => {
    try {
      if (key) {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
      setState(value)
    } catch (error) {
      console.log(error)
    }
  }

  return [state, setValue]
}

export function clearLocalStorageItem(key: string) {
  window.localStorage.removeItem(key)
}

export default useLocalStorage
