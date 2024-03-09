// Wrapper function which takes in a function, and outputs a version of the function that logs the time it took to run
export function timeit(fn: Function) {
  return async function (...args: any[]) {
    const start = Date.now()
    const result = await fn(...args)
    console.log(`${fn.name} took ${Date.now() - start}ms`)
    return result
  }
}
