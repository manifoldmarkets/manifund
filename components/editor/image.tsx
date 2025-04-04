import { Image } from '@tiptap/extension-image'
import clsx from 'clsx'
import { useState } from 'react'

export const BasicImage = Image.extend({
  renderReact: (attrs: any) => <img loading="lazy" {...attrs} />,
})

export const DisplayImage = Image.extend({
  renderReact: (attrs: any) => <ExpandingImage {...attrs} />,
})

function ExpandingImage(props: { src: string; alt?: string; title?: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <img
      loading="lazy"
      {...props}
      onClick={() => setExpanded((expanded) => !expanded)}
      className={clsx(
        'cursor-pointer object-contain',
        expanded ? 'min-h-[256px] md:min-h-[512px]' : 'h-[256px] md:h-[512px]'
      )}
      height={expanded ? undefined : 512}
    />
  )
}
