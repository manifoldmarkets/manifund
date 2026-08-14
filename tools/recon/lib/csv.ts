// Minimal quote-aware CSV parser: handles quoted fields, escaped quotes ("") and CRLF.
export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const table: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((f) => f !== '')) table.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) {
    row.push(field)
    if (row.some((f) => f !== '')) table.push(row)
  }
  if (table.length === 0) return { headers: [], rows: [] }
  const [headers, ...rest] = table
  const rows = rest.map((r) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => (obj[h] = r[i] ?? ''))
    return obj
  })
  return { headers, rows }
}
