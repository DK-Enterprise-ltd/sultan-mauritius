import {BasketIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Singleton — see homeContent.ts for the pattern this follows. Product
// names/prices/stock stay Prisma-only (see CLAUDE.md's money-path
// discipline); this is just the shop page's own heading/label copy, and
// which SKUs show in the "Mauritian Favorites" strip.
function pair(name: string, title: string, type: 'string' | 'text' = 'string') {
  return [
    defineField({name, type, title: `${title} (English)`}),
    defineField({name: `${name}Fr`, type, title: `${title} (French)`}),
  ]
}

export const productsContent = defineType({
  name: 'productsContent',
  title: 'Shop page',
  type: 'document',
  icon: BasketIcon,
  fields: [
    ...pair('title', 'Title'),
    ...pair('wholesaleNote', 'Wholesale-viewer note'),
    ...pair('empty', 'Empty-results message'),
    ...pair('favoritesTitle', 'Mauritian Favorites section title'),
    ...pair('unitsLabel', 'Units jump-button label'),
    ...pair('packsLabel', 'Packs jump-button label'),
    ...pair('unitsSectionTitle', 'Units section heading'),
    ...pair('packsSectionTitle', 'Packs section heading'),
    defineField({
      name: 'favoriteSkus',
      title: 'Mauritian Favorites — SKUs',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'Product SKUs to feature in the Mauritian Favorites strip, in order (must match Product.sku exactly, e.g. "SUL-STL-250"). Leave empty to use the developer-set default list.',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Shop page content'}
    },
  },
})
