import {HomeIcon, InfoOutlineIcon, PackageIcon, EnvelopeIcon, PinIcon, BasketIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'
import {SINGLETON_TYPES} from './schemaTypes'

// Each of these is a singleton: fixed document id, no "create new" option.
const PAGE_SINGLETONS = [
  {type: 'homeContent', title: 'Home page', icon: HomeIcon},
  {type: 'aboutContent', title: 'About page', icon: InfoOutlineIcon},
  {type: 'productsContent', title: 'Shop page', icon: BasketIcon},
  {type: 'wholesaleContent', title: 'Wholesale page', icon: PackageIcon},
  {type: 'stockistsContent', title: 'Stockists page', icon: PinIcon},
  {type: 'contactContent', title: 'Contact page', icon: EnvelopeIcon},
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...PAGE_SINGLETONS.map(({type, title, icon}) =>
        S.listItem()
          .title(title)
          .icon(icon)
          .child(S.document().schemaType(type).documentId(type).title(title))
      ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !SINGLETON_TYPES.includes(item.getId() ?? '')),
    ])
