import {PinIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Singleton — see homeContent.ts for the pattern this follows. The
// stockist list itself is the separate `stockist` document type (one
// document per shop); this is just the page's heading/intro copy.
function pair(name: string, title: string, type: 'string' | 'text' = 'string') {
  return [
    defineField({name, type, title: `${title} (English)`}),
    defineField({name: `${name}Fr`, type, title: `${title} (French)`}),
  ]
}

export const stockistsContent = defineType({
  name: 'stockistsContent',
  title: 'Stockists page',
  type: 'document',
  icon: PinIcon,
  fields: [
    ...pair('title', 'Title'),
    ...pair('intro', 'Intro', 'text'),
    ...pair('empty', 'Empty-list message', 'text'),
  ],
  preview: {
    prepare() {
      return {title: 'Stockists page content'}
    },
  },
})
