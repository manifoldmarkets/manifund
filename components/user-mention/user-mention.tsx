import { NodeViewWrapper } from '@tiptap/react'
import clsx from 'clsx'
import { SiteLink } from '../site-link'

const name = 'user-mention'
export const UserMentionNodeView = (props: any) => {
  return (
    <NodeViewWrapper className={clsx(name, 'not-prose text-orange-600')}>
      <UserMention username={props.node.attrs.label} />
    </NodeViewWrapper>
  )
}

export const UserMention = (props: { username: string }) => {
  const { username } = props
  return (
    <SiteLink href={`/${username}`} followsLinkClass>
      @{username}
    </SiteLink>
  )
}
