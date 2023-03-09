// Formatting functions
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

export function formatMoneyPrecise(amount: number) {
  const newAmount = getMoneyNumber(amount)
  return formatter.format(newAmount)
}

export function formatMoney(amount: number) {
  return `$${formatLargeNumber(amount)}`
}

export function getMoneyNumber(amount: number) {
  // Handle 499.9999999999999 case
  const plusEpsilon = (amount > 0 ? Math.floor : Math.ceil)(
    amount + 0.00000000001 * Math.sign(amount)
  )
  return Math.round(plusEpsilon) === 0 ? 0 : plusEpsilon
}

export const showPrecision = (x: number, sigfigs: number) =>
  // convert back to number for weird formatting reason
  `${Number(x.toPrecision(sigfigs))}`

// Eg 1234567.89 => 1.23M; 5678 => 5.68K
export function formatLargeNumber(num: number, sigfigs = 2): string {
  const absNum = Math.abs(num)
  if (absNum < 1) return showPrecision(num, sigfigs)

  if (absNum < 100) return showPrecision(num, 2)
  if (absNum < 1000) return showPrecision(num, 3)
  if (absNum < 10000) return showPrecision(num, 4)

  const suffix = ['', 'K', 'M', 'B', 'T', 'Q']
  const i = Math.floor(Math.log10(absNum) / 3)

  const numStr = showPrecision(num / Math.pow(10, 3 * i), sigfigs)
  return `${numStr}${suffix[i] ?? ''}`
}

export function formatDate(date: string) {
  const sections = date.split('-')
  let month = ''
  switch (sections[1]) {
    case '01':
      month = 'January'
      break
    case '02':
      month = 'February'
      break
    case '03':
      month = 'March'
      break
    case '04':
      month = 'April'
      break
    case '05':
      month = 'May'
      break
    case '06':
      month = 'June'
      break
    case '07':
      month = 'July'
      break
    case '08':
      month = 'August'
      break
    case '09':
      month = 'September'
      break
    case '10':
      month = 'October'
      break
    case '11':
      month = 'November'
      break
    case '12':
      month = 'December'
      break
  }
  return `${month} ${sections[2]}, ${sections[0]}`
}
