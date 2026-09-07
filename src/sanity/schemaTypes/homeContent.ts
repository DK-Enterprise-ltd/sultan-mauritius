import {HomeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Singleton — structure.ts pins this to a single fixed document so editors
// can't create a second one. English/French as paired fields rather than a
// localization plugin: two locales, one small doc, not worth the extra
// dependency. Revisit if locales grow.
function pair(name: string, title: string, type: 'string' | 'text' = 'string') {
  return [
    defineField({name, type, title: `${title} (English)`}),
    defineField({name: `${name}Fr`, type, title: `${title} (French)`}),
  ]
}

export const homeContent = defineType({
  name: 'homeContent',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    ...pair('heroKicker', 'Hero kicker'),
    ...pair('heroTitle', 'Hero title'),
    ...pair('heroSubtitle', 'Hero subtitle', 'text'),
    ...pair('ctaShop', 'Shop button label'),
    ...pair('ctaWholesale', 'Wholesale button label'),
    ...pair('sparklingTitle', 'Sparkling section title'),
    ...pair('sparklingBody', 'Sparkling section body', 'text'),
    ...pair('stillTitle', 'Still section title'),
    ...pair('stillBody', 'Still section body', 'text'),
    ...pair('legacyKicker', 'Legacy kicker'),
    ...pair('legacyTitle', 'Legacy title'),
    ...pair('legacyBody', 'Legacy body', 'text'),
    ...pair('legacyStat1Value', 'Stat 1 value'),
    ...pair('legacyStat1Label', 'Stat 1 label'),
    ...pair('legacyStat2Value', 'Stat 2 value'),
    ...pair('legacyStat2Label', 'Stat 2 label'),
    ...pair('legacyStat3Value', 'Stat 3 value'),
    ...pair('legacyStat3Label', 'Stat 3 label'),
    ...pair('legacyStat4Value', 'Stat 4 value'),
    ...pair('legacyStat4Label', 'Stat 4 label'),
    ...pair('socialTitle', 'Social section title'),
    ...pair('socialCta', 'Social follow link label'),
  ],
  preview: {
    prepare() {
      return {title: 'Home page content'}
    },
  },
})
