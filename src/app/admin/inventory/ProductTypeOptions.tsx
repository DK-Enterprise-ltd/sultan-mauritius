import { GRIGNOTI_TYPES, PRODUCT_TYPE_LABELS, SULTAN_TYPES } from "@/lib/product-lines";

/** <option>s for the add/edit product forms' Type select, grouped by
 * which storefront page the product will be listed on. */
export default function ProductTypeOptions() {
  return (
    <>
      <optgroup label="Sultan water (/products)">
        {SULTAN_TYPES.map((type) => (
          <option key={type} value={type}>
            {PRODUCT_TYPE_LABELS[type]}
          </option>
        ))}
      </optgroup>
      <optgroup label="Grignoti Store (/grignoti)">
        {GRIGNOTI_TYPES.map((type) => (
          <option key={type} value={type}>
            {PRODUCT_TYPE_LABELS[type]}
          </option>
        ))}
      </optgroup>
    </>
  );
}
