'use client'
import { Button } from '@/components/button'

export function DownloadTextButton(props: {
  buttonText: string
  toDownload: string
  filename: string
}) {
  const { buttonText, toDownload, filename } = props
  // When called, download the data in the UserAndProfiles table as a CSV file
  function toCSV() {
    const blob = new Blob([toDownload], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  return <Button onClick={toCSV}>{buttonText}</Button>
}
