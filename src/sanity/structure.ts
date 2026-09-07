import {HomeIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

// homeContent is a singleton: fixed document id, no "create new" option.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home page')
        .icon(HomeIcon)
        .child(S.document().schemaType('homeContent').documentId('homeContent').title('Home page')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'homeContent'),
    ])
