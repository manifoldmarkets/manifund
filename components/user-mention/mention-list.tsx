import { SuggestionProps } from '@tiptap/suggestion'
import clsx from 'clsx'
import { MiniProfile } from '@/db/profile'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Avatar } from '@/components/avatar'

// copied from https://tiptap.dev/api/nodes/mention#usage
export const MentionList = forwardRef<any, SuggestionProps<MiniProfile>>(
  ({ items: profiles, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    useEffect(() => setSelectedIndex(0), [profiles])

    const submitUser = (index: number) => {
      const profile = profiles[index]
      if (profile) command({ id: profile.id, label: profile.username } as any)
    }

    const onUp = () => setSelectedIndex((i) => (i + profiles.length - 1) % profiles.length)
    const onDown = () => setSelectedIndex((i) => (i + 1) % profiles.length)
    const onEnter = () => submitUser(selectedIndex)

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: any) => {
        if (event.key === 'ArrowUp') {
          onUp()
          return true
        }
        if (event.key === 'ArrowDown') {
          onDown()
          return true
        }
        if (event.key === 'Enter') {
          onEnter()
          return true
        }
        return false
      },
    }))

    return (
      <div className="w-42 absolute z-10 overflow-x-hidden rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        {!profiles.length ? (
          <span className="m-1 whitespace-nowrap">No results...</span>
        ) : (
          profiles.map((profile, i) => (
            <button
              className={clsx(
                'flex h-8 w-full cursor-pointer select-none items-center gap-2 truncate px-4',
                selectedIndex === i ? 'bg-orange-500 text-white' : 'text-gray-900'
              )}
              onClick={() => submitUser(i)}
              key={profile.id}
            >
              <Avatar
                username={profile.username}
                avatarUrl={profile.avatar_url}
                id={profile.id}
                size="xs"
                noLink
              />
              {profile.username}
            </button>
          ))
        )}
      </div>
    )
  }
)

MentionList.displayName = 'MentionList'
