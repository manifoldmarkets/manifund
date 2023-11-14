import { useCallback, useRef } from 'react'
import { useSafeLayoutEffect } from './use-safe-layout-effect'

export function useEvent<T extends Function>(callback?: T) {
  const ref = useRef<Function | undefined>(() => {
    throw new Error('Cannot call an event handler while rendering.')
  })
  useSafeLayoutEffect(() => {
    ref.current = callback
  })
  return useCallback<Function>(
    (...args: any) => ref.current?.apply(null, args),
    []
  ) as T
}
