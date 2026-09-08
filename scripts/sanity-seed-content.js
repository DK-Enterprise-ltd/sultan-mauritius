// One-time: publish the site's existing copy into Sanity as starting
// content, so the Studio isn't handed empty forms. Real copy already
// live on the site (messages/en.json, messages/fr.json), not invented.
// Run once: node scripts/sanity-seed-content.js
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@sanity/client");
const en = require("../messages/en.json");
const fr = require("../messages/fr.json");

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_KEY,
  useCdn: false,
});

async function seedHomeContent() {
  const h = en.home;
  const hFr = fr.home;
  await sanity.createOrReplace({
    _id: "homeContent",
    _type: "homeContent",
    heroKicker: h.heroKicker,
    heroKickerFr: hFr.heroKicker,
    heroTitle: h.heroTitle,
    heroTitleFr: hFr.heroTitle,
    heroSubtitle: h.heroSubtitle,
    heroSubtitleFr: hFr.heroSubtitle,
    ctaShop: h.ctaShop,
    ctaShopFr: hFr.ctaShop,
    ctaWholesale: h.ctaWholesale,
    ctaWholesaleFr: hFr.ctaWholesale,
    sparklingTitle: h.sparklingTitle,
    sparklingTitleFr: hFr.sparklingTitle,
    sparklingBody: h.sparklingBody,
    sparklingBodyFr: hFr.sparklingBody,
    stillTitle: h.stillTitle,
    stillTitleFr: hFr.stillTitle,
    stillBody: h.stillBody,
    stillBodyFr: hFr.stillBody,
    legacyKicker: h.legacyKicker,
    legacyKickerFr: hFr.legacyKicker,
    legacyTitle: h.legacyTitle,
    legacyTitleFr: hFr.legacyTitle,
    legacyBody: h.legacyBody,
    legacyBodyFr: hFr.legacyBody,
    legacyStat1Value: h.legacyStat1Value,
    legacyStat1ValueFr: hFr.legacyStat1Value,
    legacyStat1Label: h.legacyStat1Label,
    legacyStat1LabelFr: hFr.legacyStat1Label,
    legacyStat2Value: h.legacyStat2Value,
    legacyStat2ValueFr: hFr.legacyStat2Value,
    legacyStat2Label: h.legacyStat2Label,
    legacyStat2LabelFr: hFr.legacyStat2Label,
    legacyStat3Value: h.legacyStat3Value,
    legacyStat3ValueFr: hFr.legacyStat3Value,
    legacyStat3Label: h.legacyStat3Label,
    legacyStat3LabelFr: hFr.legacyStat3Label,
    legacyStat4Value: h.legacyStat4Value,
    legacyStat4ValueFr: hFr.legacyStat4Value,
    legacyStat4Label: h.legacyStat4Label,
    legacyStat4LabelFr: hFr.legacyStat4Label,
    socialTitle: h.socialTitle,
    socialTitleFr: hFr.socialTitle,
    socialCta: h.socialCta,
    socialCtaFr: hFr.socialCta,
  });
  console.log("Seeded homeContent.");
}

async function seedProductCopy() {
  const d = en.productDetail;
  const dFr = fr.productDetail;
  // Same SKUs as prisma/seed.js. Copy is type-level (see the ponytail
  // note in the product detail page) — every sparkling SKU gets the same
  // starting taste/best-served text, every still SKU the same.
  const skus = [
    { sku: "SUL-SPK-WMS-330", type: "SPARKLING" },
    { sku: "SUL-SPK-POM-330", type: "SPARKLING" },
    { sku: "SUL-SPK-BMC-330", type: "SPARKLING" },
    { sku: "SUL-STL-500", type: "STILL" },
    { sku: "SUL-STL-1500", type: "STILL" },
  ];

  for (const { sku, type } of skus) {
    const isSparkling = type === "SPARKLING";
    await sanity.createOrReplace({
      _id: `productCopy-${sku}`,
      _type: "productCopy",
      sku,
      tasteNote: isSparkling ? d.tasteSparkling : d.tasteStill,
      tasteNoteFr: isSparkling ? dFr.tasteSparkling : dFr.tasteStill,
      bestServedNote: isSparkling ? d.bestServedSparkling : d.bestServedStill,
      bestServedNoteFr: isSparkling ? dFr.bestServedSparkling : dFr.bestServedStill,
    });
  }
  console.log(`Seeded ${skus.length} productCopy doc(s).`);
}

async function seedAboutContent() {
  const a = en.about;
  const aFr = fr.about;
  await sanity.createOrReplace({
    _id: "aboutContent",
    _type: "aboutContent",
    heroKicker: a.heroKicker,
    heroKickerFr: aFr.heroKicker,
    heroTitle: a.heroTitle,
    heroTitleFr: aFr.heroTitle,
    heroSubtitle: a.heroSubtitle,
    heroSubtitleFr: aFr.heroSubtitle,
    qualityKicker: a.qualityKicker,
    qualityKickerFr: aFr.qualityKicker,
    qualityTitle: a.qualityTitle,
    qualityTitleFr: aFr.qualityTitle,
    qualityBody: a.qualityBody,
    qualityBodyFr: aFr.qualityBody,
    paramsHeading: a.paramsHeading,
    paramsHeadingFr: aFr.paramsHeading,
    paramsNote: a.paramsNote,
    paramsNoteFr: aFr.paramsNote,
    mauritiusKicker: a.mauritiusKicker,
    mauritiusKickerFr: aFr.mauritiusKicker,
    mauritiusTitle: a.mauritiusTitle,
    mauritiusTitleFr: aFr.mauritiusTitle,
    mauritiusBody: a.mauritiusBody,
    mauritiusBodyFr: aFr.mauritiusBody,
    galleryHeading: a.galleryHeading,
    galleryHeadingFr: aFr.galleryHeading,
    ctaTitle: a.ctaTitle,
    ctaTitleFr: aFr.ctaTitle,
    ctaBody: a.ctaBody,
    ctaBodyFr: aFr.ctaBody,
  });
  console.log("Seeded aboutContent.");
}

async function seedWholesaleContent() {
  const w = en.wholesale;
  const wFr = fr.wholesale;
  await sanity.createOrReplace({
    _id: "wholesaleContent",
    _type: "wholesaleContent",
    kicker: w.kicker,
    kickerFr: wFr.kicker,
    title: w.title,
    titleFr: wFr.title,
    subtitle: w.subtitle,
    subtitleFr: wFr.subtitle,
    talkPrefix: w.talkPrefix,
    talkPrefixFr: wFr.talkPrefix,
    talkOr: w.talkOr,
    talkOrFr: wFr.talkOr,
  });
  console.log("Seeded wholesaleContent.");
}

async function seedContactContent() {
  const c = en.contact;
  const cFr = fr.contact;
  await sanity.createOrReplace({
    _id: "contactContent",
    _type: "contactContent",
    title: c.title,
    titleFr: cFr.title,
    subtitle: c.subtitle,
    subtitleFr: cFr.subtitle,
  });
  console.log("Seeded contactContent.");
}

async function seedStockistsContent() {
  const s = en.stockists;
  const sFr = fr.stockists;
  await sanity.createOrReplace({
    _id: "stockistsContent",
    _type: "stockistsContent",
    title: s.title,
    titleFr: sFr.title,
    intro: s.intro,
    introFr: sFr.intro,
    empty: s.empty,
    emptyFr: sFr.empty,
  });
  console.log("Seeded stockistsContent.");
}

async function seedProductsContent() {
  const p = en.products;
  const pFr = fr.products;
  await sanity.createOrReplace({
    _id: "productsContent",
    _type: "productsContent",
    title: p.title,
    titleFr: pFr.title,
    wholesaleNote: p.wholesaleNote,
    wholesaleNoteFr: pFr.wholesaleNote,
    empty: p.empty,
    emptyFr: pFr.empty,
    favoritesTitle: p.favoritesTitle,
    favoritesTitleFr: pFr.favoritesTitle,
    unitsLabel: p.unitsLabel,
    unitsLabelFr: pFr.unitsLabel,
    packsLabel: p.packsLabel,
    packsLabelFr: pFr.packsLabel,
    unitsSectionTitle: p.unitsSectionTitle,
    unitsSectionTitleFr: pFr.unitsSectionTitle,
    packsSectionTitle: p.packsSectionTitle,
    packsSectionTitleFr: pFr.packsSectionTitle,
  });
  console.log("Seeded productsContent.");
}

async function main() {
  // seedHomeContent/seedProductCopy already ran once (see the file header).
  // createOrReplace() fully overwrites the document, so re-running them
  // would blow away any edits already made in Studio. Only uncomment if
  // you specifically want to reset those two back to the messages.json
  // snapshot.
  // await seedHomeContent();
  // await seedProductCopy();
  await seedAboutContent();
  await seedWholesaleContent();
  await seedContactContent();
  await seedStockistsContent();
  await seedProductsContent();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
