/**
 * Reducer function that determines how to aggregate values
 * @param existing The existing accumulated value (or undefined if first item)
 * @param item The current item being processed
 * @returns The new accumulated value
 */
export type Reducer<T, V> = (existing: V | undefined, item: T) => V

/**
 * Common reducers for reduceBy operations
 */
export const Reducers = {
  /** Appends items to an array */
  append:
    <T>(): Reducer<T, T[]> =>
    (existing, item) => {
      const arr = existing || []
      arr.push(item)
      return arr
    },

  /** Sums a numeric property */
  sum:
    <T>(valueFn: (item: T) => number): Reducer<T, number> =>
    (existing, item) =>
      (existing || 0) + valueFn(item),

  /** Counts occurrences */
  count:
    <T>(): Reducer<T, number> =>
    (existing) =>
      (existing || 0) + 1,

  /** Logical OR - true if any item matches */
  or:
    <T>(predicate: (item: T) => boolean): Reducer<T, boolean> =>
    (existing, item) =>
      existing || false || predicate(item),

  /** Logical AND - true if all items match */
  and:
    <T>(predicate: (item: T) => boolean): Reducer<T, boolean> =>
    (existing, item) =>
      (existing ?? true) && predicate(item),
}

/**
 * Reduces items by a key using a reducer function
 * @param items Array of items to process
 * @param keyFn Function that returns the key to group by
 * @param reducer Function that determines how to aggregate values
 * @returns Map where keys are the result of keyFn and values are reduced results
 */
export function reduceBy<T, K, V>(
  items: T[],
  keyFn: (item: T) => K,
  reducer: Reducer<T, V>
): Map<K, V> {
  const map = new Map<K, V>()

  items.forEach((item) => {
    const key = keyFn(item)
    const existing = map.get(key)
    map.set(key, reducer(existing, item))
  })

  return map
}
