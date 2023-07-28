import { useState } from 'react'

const useLocalStorage = (initialValue: string, key?: string) => {
  const [state, setState] = useState(() => {
    // Initialize the state
    try {
      const value = key ? window.localStorage.getItem(key) : initialValue
      // Check if the local storage already has any values,
      // otherwise initialize it with the passed initialValue
      return value ? JSON.parse(value) : initialValue
    } catch (error) {
      console.log(error)
    }
  })

  const setValue = (value: any) => {
    try {
      // If the passed value is a callback function,
      //  then call it with the existing state.
      const valueToStore = value instanceof Function ? value(state) : value
      if (key) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
      setState(value)
    } catch (error) {
      console.log(error)
    }
  }

  const clearValue = () => {
    try {
      if (key) {
        window.localStorage.removeItem(key)
      }
      setState(undefined)
    } catch (error) {
      console.log(error)
    }
  }

  return [state, setValue, clearValue]
}

export default useLocalStorage
