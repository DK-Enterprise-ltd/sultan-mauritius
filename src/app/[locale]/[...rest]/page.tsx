import { notFound } from "next/navigation";

// Catches any /en/* or /fr/* path that doesn't match a real route (typo,
// dead link) and hands it to ../not-found.tsx. Without this, an unmatched
// path skips every custom not-found boundary and falls through to Next's
// bare built-in 404 (see the note in ../not-found.tsx).
export default function CatchAll(): never {
  notFound();
}
