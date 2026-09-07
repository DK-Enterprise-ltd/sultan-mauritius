import {PinIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

// Regions kept in Studio, not in the Prisma enum, so the list can change
// without a DB migration — see prisma/schema.prisma Stockist model.
const REGIONS = ['North', 'Centre', 'West', 'East', 'South']

export const stockist = defineType({
  name: 'stockist',
  title: 'Stockist',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Shop name',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'region',
      type: 'string',
      options: {list: REGIONS, layout: 'radio'},
      validation: (r) => r.required(),
    }),
    defineField({name: 'town', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'address', type: 'string'}),
    defineField({name: 'phone', type: 'string'}),
    defineField({name: 'mapUrl', type: 'url', title: 'Google Maps link'}),
    defineField({name: 'isActive', type: 'boolean', initialValue: true}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'town'},
  },
})
