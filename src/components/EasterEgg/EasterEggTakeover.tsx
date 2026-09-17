"use client";

// ponytail: reskins the live page in place (text nodes + <img src>) instead
// of duplicating every page's content for two states. Nav stays untouched
// via [data-egg-skip] so the EN/FR undo buttons are always reachable.
import { useEffect, useRef } from "react";
import { useEasterEgg, type EggKind } from "@/lib/easter-egg";

const IMAGE_SRC: Record<EggKind, string> = {
  dumb: "/dumb&dumber.jpeg",
  gucci: "/morty_gucci.jpg",
};

const WORDS: Record<EggKind, string[]> = {
  dumb: ["Dumb", "and", "Dumber.", "No-brainer.", "Harry", "and", "Lloyd."],
  gucci: ["Gucci", "Morty.", "Wubba", "lubba", "dub", "dub."],
};

type TextWithOriginal = Text & { __eggOriginal?: string };
type ImgWithOriginal = HTMLImageElement & {
  __eggOriginalSrc?: string | null;
  __eggOriginalSrcset?: string | null;
};

function pickWord(kind: EggKind, index: number) {
  const words = WORDS[kind];
  return words[index % words.length];
}

function applyEgg(kind: EggKind) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest("script, style, [data-egg-skip]")) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let i = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as TextWithOriginal;
    if (text.__eggOriginal === undefined) text.__eggOriginal = text.nodeValue ?? "";
    const next = pickWord(kind, i++);
    if (text.nodeValue !== next) text.nodeValue = next;
  }

  document.querySelectorAll("img").forEach((imgEl) => {
    const img = imgEl as ImgWithOriginal;
    if (img.__eggOriginalSrc === undefined) {
      img.__eggOriginalSrc = img.getAttribute("src");
      img.__eggOriginalSrcset = img.getAttribute("srcset");
    }
    if (img.getAttribute("src") !== IMAGE_SRC[kind]) {
      img.removeAttribute("srcset");
      img.setAttribute("src", IMAGE_SRC[kind]);
    }
  });
}

function restoreOriginal() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as TextWithOriginal;
    if (text.__eggOriginal !== undefined) {
      text.nodeValue = text.__eggOriginal;
      delete text.__eggOriginal;
    }
  }

  document.querySelectorAll("img").forEach((imgEl) => {
    const img = imgEl as ImgWithOriginal;
    if (img.__eggOriginalSrc !== undefined) {
      if (img.__eggOriginalSrc) img.setAttribute("src", img.__eggOriginalSrc);
      if (img.__eggOriginalSrcset) img.setAttribute("srcset", img.__eggOriginalSrcset);
      delete img.__eggOriginalSrc;
      delete img.__eggOriginalSrcset;
    }
  });
}

export default function EasterEggTakeover() {
  const kind = useEasterEgg();
  const applyingRef = useRef(false);

  useEffect(() => {
    if (!kind) {
      restoreOriginal();
      return;
    }

    applyEgg(kind);
    const observer = new MutationObserver(() => {
      if (applyingRef.current) return;
      applyingRef.current = true;
      applyEgg(kind);
      applyingRef.current = false;
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [kind]);

  return null;
}
