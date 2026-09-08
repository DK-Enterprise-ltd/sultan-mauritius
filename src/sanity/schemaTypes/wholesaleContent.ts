import {PackageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Singleton — see homeContent.ts for the pattern this follows.
function pair(name: string, title: string, type: 'string' | 'text' = 'string') {
  return [
    defineField({name, type, title: `${title} (English)`}),
    defineField({name: `${name}Fr`, type, title: `${title} (French)`}),
  ]
}

export const wholesaleContent = defineType({
  name: 'wholesaleContent',
  title: 'Wholesale page',
  type: 'document',
  icon: PackageIcon,
  fields: [
    ...pair('kicker', 'Kicker'),
    ...pair('title', 'Title'),
    ...pair('subtitle', 'Subtitle', 'text'),
    ...pair('talkPrefix', 'Phone prompt prefix (e.g. "Prefer to talk? Call")'),
    ...pair('talkOr', 'Phone/email joiner (e.g. "or email")'),
  ],
  preview: {
    prepare() {
      return {title: 'Wholesale page content'}
    },
  },
})
