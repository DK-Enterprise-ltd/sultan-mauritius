// ponytail: mirrors ../../studio/schemaTypes. Vercel only builds this repo,
// not the sibling ../studio folder, so the schema is duplicated here rather
// than imported across the two — keep both in sync by hand when the content
// model changes. ../studio remains the schema's source of truth.
import {stockist} from './stockist'
import {productCopy} from './productCopy'
import {homeContent} from './homeContent'

export const schemaTypes = [stockist, productCopy, homeContent]
