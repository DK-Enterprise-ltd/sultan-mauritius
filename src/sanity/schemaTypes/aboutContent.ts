import {InfoOutlineIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Singleton — Structure (structure.ts) pins this to a single fixed
// document so editors can't create a second one. See homeContent.ts for
// why English/French are paired fields rather than a localization plugin.
function pair(name: string, title: string, type: 'string' | 'text' = 'string') {
  return [
    defineField({name, type, title: `${title} (English)`}),
    defineField({name: `${name}Fr`, type, title: `${title} (French)`}),
  ]
}

export const aboutContent = defineType({
  name: 'aboutContent',
  title: 'About page',
  type: 'document',
  icon: InfoOutlineIcon,
  fields: [
    ...pair('heroKicker', 'Hero kicker'),
    ...pair('heroTitle', 'Hero title'),
    ...pair('heroSubtitle', 'Hero subtitle', 'text'),
    ...pair('qualityKicker', 'Quality section kicker'),
    ...pair('qualityTitle', 'Quality section title'),
    ...pair('qualityBody', 'Quality section body', 'text'),
    ...pair('paramsHeading', 'Water parameters heading'),
    ...pair('paramsNote', 'Water parameters note'),
    ...pair('mauritiusKicker', 'Sultan in Mauritius kicker'),
    ...pair('mauritiusTitle', 'Sultan in Mauritius title'),
    ...pair('mauritiusBody', 'Sultan in Mauritius body', 'text'),
    ...pair('galleryHeading', 'Gallery heading'),
    ...pair('ctaTitle', 'Closing CTA title'),
    ...pair('ctaBody', 'Closing CTA body', 'text'),
  ],
  preview: {
    prepare() {
      return {title: 'About page content'}
    },
  },
})
