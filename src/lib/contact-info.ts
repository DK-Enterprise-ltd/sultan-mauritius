// Single source for the contact details shown across the footer, legal
// pages, and wholesale/contact pages — previously each page hardcoded its
// own copy of these strings, which is how the phone number ended up
// inconsistent (full placeholder in some places, a shortened address in
// others) despite meaning the same thing everywhere.

// ponytail: still a placeholder ("5 000 0000" is a dummy pattern, not a
// real Mauritius line). Replace with the business's real number and drop
// this comment; nothing else needs to change, every page reads from here.
export const CONTACT_PHONE_DISPLAY = "+230 5 000 0000";
export const CONTACT_PHONE_TEL = "+23050000000";
// contact@ on the site's own domain, not the sultan.mu domain the site used
// to show (a mismatch between the displayed email and the site's own
// domain was itself flagged as a trust signal issue). Same Resend domain
// (sultanmauritius.com) already verified and sending as EMAIL_FROM, so no
// separate Resend setup is needed for this address.
export const CONTACT_EMAIL = "contact@sultanmauritius.com";

// Registered-office address (matches the Legal Notice's Company section
// and the invoice PDF) — real, not a placeholder.
export const CONTACT_ADDRESS_STREET = "95, La Paix Street";
export const CONTACT_ADDRESS_LOCALITY = "Port Louis, Mauritius";
export const CONTACT_ADDRESS_FULL = `${CONTACT_ADDRESS_STREET}, ${CONTACT_ADDRESS_LOCALITY}`;
