'use client'
import { TextEditor, useTextEditor } from '@/components/editor'
import { Input } from '@/components/input'
import { useState } from 'react'

const DEFAULT_DESCRIPTION = `
<h3>What will the recipient use this funding for?</h3>
</br>
<h3>What's the case for this grant?</h3>
</br>
<h3>What are your main reservations about this grant?</h3>
</br>
<h3>How did you choose this amount?</h3>
</br>
<h3>Please list any ways in which this grant could be actively harmful.</h3>
</br>
<h3>Are there any conflicts of interest associated with this grant?</h3>
<strong>Please disclose e.g. any romantic, professional, financial, housemate, or familial relationships you have with the grant recipient(s).</strong>
</br>
<h3>What other funding is this person or project getting? Where else did this person or project apply for funding in the past?</h3>
</br>
`

export default function CreateGrant() {
  const [recipientUsername, setRecipientUsername] = useState('')
  const [recipientFullName, setRecipientFullName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const editor = useTextEditor(description)
  return (
    <div>
      <Input
        type="text"
        value={recipientUsername}
        onChange={(event) => setRecipientUsername(event.target.value)}
      />
      <Input
        type="text"
        value={recipientFullName}
        onChange={(event) => setRecipientFullName(event.target.value)}
      />
      <Input
        type="text"
        value={recipientEmail}
        onChange={(event) => setRecipientEmail(event.target.value)}
      />
      <Input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Input
        type="text"
        value={subtitle}
        onChange={(event) => setSubtitle(event.target.value)}
      />
      <Input
        type="number"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
      />
      <TextEditor editor={editor} />
      <div className="flex">
        <div className="flex h-6 items-center">
          <input
            id="terms"
            aria-describedby="terms-description"
            name="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
            checked={agreedToTerms}
            onChange={() => setAgreedToTerms(!agreedToTerms)}
          />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="terms" className="font-medium text-gray-900">
            Check this box to confirm:
          </label>{' '}
          <span id="terms-description" className="text-gray-500">
            all information provided is true and accurate to the best of my
            knowledge. This project is not-for-profit and not part of a
            political campaign. I understand that all of my answers here will be
            publicly accessible on Manifund.
          </span>
        </div>
      </div>
    </div>
  )
}
