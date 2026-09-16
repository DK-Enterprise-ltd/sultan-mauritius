import type { SalesChannel } from "@prisma/client";

// Standard direct-delivery areas, business-confirmed 2026-09. Anything
// outside this list is pickup-only: the customer still orders, but a
// pickup point is agreed with them before the order is confirmed rather
// than being picked at checkout.
export const STANDARD_DELIVERY_AREAS = [
  "Pamplemousses",
  "Mon Choisy",
  "Trou aux Biches",
  "Triolet",
  "Vale",
  "Goodlands",
  "Plaine des Papayes",
  "Terre Rouge",
  "Riche Terre",
  "Port Louis",
  "Pailles",
  "Moka",
  "Rose Hill",
  "Quatre Bornes",
  "Curepipe",
  "Phoenix",
  "Bambous",
  "Flic-en-Flac",
  "Tamarin",
] as const;

export const PICKUP_OPTION = "Outside standard areas — arrange pickup" as const;

// ponytail: a single MUR-wide minimum, applied to every B2C order
// regardless of area — the business doc only states it for "delivery",
// but gives no separate rule for pickup orders, so one threshold for the
// whole channel is the safer reading. Revisit if pickup ever needs its
// own (lower) minimum.
export const MIN_B2C_ORDER_MUR = 1200;
export const B2C_DELIVERY_FEE_MUR = 150;

export function isStandardDeliveryArea(zone: string | undefined | null): boolean {
  return !!zone && (STANDARD_DELIVERY_AREAS as readonly string[]).includes(zone);
}

export function fulfillmentMethodFor(zone: string | undefined | null): "DELIVERY" | "PICKUP" {
  return isStandardDeliveryArea(zone) ? "DELIVERY" : "PICKUP";
}

/** B2C pays a flat fee for delivery in a standard area; approved B2B
 * delivery in a standard area is free; pickup (either channel) has no
 * delivery fee since the customer collects. */
export function calculateDeliveryFee(channel: SalesChannel, zone: string | undefined | null): number {
  if (!isStandardDeliveryArea(zone)) return 0;
  return channel === "B2C" ? B2C_DELIVERY_FEE_MUR : 0;
}
