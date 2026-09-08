// ponytail: mirrors ../../studio/schemaTypes. Vercel only builds this repo,
// not the sibling ../studio folder, so the schema is duplicated here rather
// than imported across the two — keep both in sync by hand when the content
// model changes. ../studio remains the schema's source of truth.
import {stockist} from './stockist'
import {productCopy} from './productCopy'
import {homeContent} from './homeContent'
import {aboutContent} from './aboutContent'
import {wholesaleContent} from './wholesaleContent'
import {contactContent} from './contactContent'
import {stockistsContent} from './stockistsContent'
import {productsContent} from './productsContent'

export const schemaTypes = [
  stockist,
  productCopy,
  homeContent,
  aboutContent,
  wholesaleContent,
  contactContent,
  stockistsContent,
  productsContent,
]

// Singleton document types: Structure (structure.ts) pins each to one
// fixed document id and hides the "create new" option for it.
export const SINGLETON_TYPES = [
  'homeContent',
  'aboutContent',
  'wholesaleContent',
  'contactContent',
  'stockistsContent',
  'productsContent',
]
