import { SiteLink } from '../site-link'

export const UserMention = (props: { userName: string }) => {
  const { userName } = props
  return (
    <SiteLink href={`/${userName}`} followsLinkClass>
      @{userName}
    </SiteLink>
  )
}
