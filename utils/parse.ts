import { JSONContent } from '@tiptap/react'
import { uniq } from 'lodash'

export const beginsWith = (text: string, query: string) =>
  text.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())

export const searchInAny = (query: string, ...fields: string[]) =>
  fields.some((field) => checkAgainstQuery(query, field))

const checkAgainstQuery = (query: string, corpus: string) =>
  query.split(' ').every((word) => wordIn(word, corpus))

// TODO: fuzzy matching
export const wordIn = (word: string, corpus: string) =>
  corpus.toLocaleLowerCase().includes(word.toLocaleLowerCase())

/** @return user ids of all \@mentions */
export function parseMentions(data: JSONContent): string[] {
  const mentions = data.content?.flatMap(parseMentions) ?? [] //dfs
  if (data.type === 'mention' && data.attrs) {
    mentions.push(data.attrs.id as string)
  }
  return uniq(mentions)
}
