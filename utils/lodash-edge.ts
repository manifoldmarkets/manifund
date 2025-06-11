/**
 * Edge Runtime-compatible implementations of commonly used lodash functions
 * These avoid dynamic code evaluation and work in Edge Runtime
 */

/**
 * Creates an array of unique values
 * @param array The array to inspect
 * @returns Returns the new array of unique values
 */
export function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Creates an array of elements, sorted in ascending order by the results of
 * running each element in a collection through iteratee
 * @param collection The collection to iterate over
 * @param iteratee The iteratee to transform keys (can be a function or property name)
 * @returns Returns the new sorted array
 */
export function sortBy<T>(
  collection: T[],
  iteratee: ((item: T) => any) | keyof T
): T[] {
  // Create a copy to avoid mutating the original
  const sorted = [...collection]

  return sorted.sort((a, b) => {
    let aVal: any
    let bVal: any

    if (typeof iteratee === 'function') {
      aVal = iteratee(a)
      bVal = iteratee(b)
    } else {
      aVal = a[iteratee]
      bVal = b[iteratee]
    }

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Compare values
    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
    return 0
  })
}
