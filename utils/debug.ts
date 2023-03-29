// Calculate the size of this javascript object in memory; to make sure Supabase responses aren't too large
// https://stackoverflow.com/a/11900218/1123955
export function getObjectSize(obj: any) {
  var objectList = []
  var stack = [obj]
  var bytes = 0

  while (stack.length) {
    var value = stack.pop()

    if (typeof value === 'boolean') {
      bytes += 4
    } else if (typeof value === 'string') {
      bytes += value.length * 2
    } else if (typeof value === 'number') {
      bytes += 8
    } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
      objectList.push(value)

      for (var i in value) {
        stack.push(value[i])
      }
    }
  }
  return bytes
}
