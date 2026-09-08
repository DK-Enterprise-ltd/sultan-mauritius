import {EnvelopeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Singleton — see homeContent.ts for the pattern this follows.
function pair(name: string, title: string, type: 'string' | 'text' = 'string') {
  return [
    defineField({name, type, title: `${title} (English)`}),
    defineField({name: `${name}Fr`, type, title: `${title} (French)`}),
  ]
}

export const contactContent = defineType({
  name: 'contactContent',
  title: 'Contact page',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    ...pair('title', 'Title'),
    ...pair('subtitle', 'Subtitle', 'text'),
  ],
  preview: {
    prepare() {
      return {title: 'Contact page content'}
    },
  },
})
