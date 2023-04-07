import Mention from '@tiptap/extension-mention'
import { mergeAttributes } from '@tiptap/react'
import { mentionSuggestion } from './mention-suggestion'
import { UserMention } from './user-mention'

const name = 'mention-component'

/**
 *  Mention extension that renders React. See:
 *  https://tiptap.dev/guide/custom-extensions#extend-existing-extensions
 *  https://tiptap.dev/guide/node-views/react#render-a-react-component
 */
export const DisplayMention = Mention.extend({
  parseHTML: () => [{ tag: name }, { tag: `a[data-type="${name}"]` }],
  renderHTML: ({ HTMLAttributes }) => [
    name,
    mergeAttributes({ HTMLAttributes }),
    0,
  ],
  renderReact: (attrs: any) => <UserMention userName={attrs.label} />,
}).configure({ suggestion: mentionSuggestion })

{
  /* <mention-component id="9a3a1419-2f01-4006-b744-887faf56551d" label="rachelTufts"></mention-component>

<span class="react-renderer node-mention inline-block" contenteditable="false">
  <div class="mention-component" data-node-view-wrapper="" style="white-space: normal;">
    <span class="break-anywhere">
      <a class="text-orange-600" href="/rachelTufts">
        @rachelTufts
      </a>
    </span>
  </div>
</span> */
}
