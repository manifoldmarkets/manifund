'use client'
import { useState } from 'react'

// Like useState, but first checks for a JSON object stored under the key in the browser's localStorage
// If key is not set, does nothing.
const useLocalStorage = <type>(initialValue: type, key?: string) => {
  const [state, setState] = useState<type>(() => {
    try {
      const initialValueString = JSON.stringify(initialValue)
      const value = key ? window.localStorage.getItem(key) : initialValueString
      return value ? JSON.parse(value) : initialValue
    } catch (error) {
      console.log(error)
    }
  })

  const saveValue = (value: type) => {
    try {
      if (key) {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
      console.log('saving', value)
      setState(value)
    } catch (error) {
      console.log(error)
    }
  }
  return { value: state, saveValue }
}

export function clearLocalStorageItem(key: string) {
  window.localStorage.removeItem(key)
}

export default useLocalStorage
