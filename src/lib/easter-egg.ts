"use client";

// ponytail: localStorage-only, no server/DB write — the egg is purely
// client-side so it's scoped to whoever is clicking, never visible to
// other visitors.
import { useEffect, useState } from "react";

export type EggKind = "dumb" | "gucci";

const ACTIVE_KEY = "sultan_egg";
const EN_KEY = "sultan_egg_en_clicks";
const FR_KEY = "sultan_egg_fr_clicks";
const UNDO_KEY = "sultan_egg_undo_clicks";
const CHANGE_EVENT = "sultan-egg-change";

const ACTIVATE_AT = 12;
const UNDO_AT = 5;

function readActive(): EggKind | null {
  const v = localStorage.getItem(ACTIVE_KEY);
  return v === "dumb" || v === "gucci" ? v : null;
}

function setActive(kind: EggKind | null) {
  if (kind) localStorage.setItem(ACTIVE_KEY, kind);
  else localStorage.removeItem(ACTIVE_KEY);
  localStorage.removeItem(EN_KEY);
  localStorage.removeItem(FR_KEY);
  localStorage.removeItem(UNDO_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function registerNavClick(lang: "en" | "fr") {
  if (readActive()) {
    const n = Number(localStorage.getItem(UNDO_KEY) ?? "0") + 1;
    if (n >= UNDO_AT) setActive(null);
    else localStorage.setItem(UNDO_KEY, String(n));
    return;
  }

  const key = lang === "en" ? EN_KEY : FR_KEY;
  const otherKey = lang === "en" ? FR_KEY : EN_KEY;
  const n = Number(localStorage.getItem(key) ?? "0") + 1;
  localStorage.removeItem(otherKey);
  if (n >= ACTIVATE_AT) setActive(lang === "en" ? "dumb" : "gucci");
  else localStorage.setItem(key, String(n));
}

export function useEasterEgg(): EggKind | null {
  const [kind, setKind] = useState<EggKind | null>(null);
  useEffect(() => {
    setKind(readActive());
    const onChange = () => setKind(readActive());
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return kind;
}
