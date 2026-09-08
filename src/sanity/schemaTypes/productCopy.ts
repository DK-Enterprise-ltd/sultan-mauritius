import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Keyed by SKU, not a reference to a `product` document — Sanity doesn't
// hold the catalogue (price/stock stay in Postgres via Prisma, see
// CLAUDE.md's money-path discipline). Match the sku exactly as it appears
// in prisma/seed.js, e.g. "SUL-SPK-WMS-330".
export const productCopy = defineType({
  name: 'productCopy',
  title: 'Product copy',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'sku',
      type: 'string',
      description: 'Must match a Product.sku in the Sultan catalogue exactly.',
      validation: (r) => r.required(),
    }),
    defineField({name: 'tasteNote', type: 'text', title: 'Taste (English)'}),
    defineField({name: 'tasteNoteFr', type: 'text', title: 'Taste (French)'}),
    defineField({name: 'bestServedNote', type: 'string', title: 'Best served (English)'}),
    defineField({name: 'bestServedNoteFr', type: 'string', title: 'Best served (French)'}),
    defineField({name: 'specNote', type: 'text', title: 'Extra spec note (English)'}),
    defineField({name: 'specNoteFr', type: 'text', title: 'Extra spec note (French)'}),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Product photo',
      description: 'Overrides the developer-set catalogue photo for this SKU when set.',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {title: 'sku', subtitle: 'tasteNote'},
  },
})
