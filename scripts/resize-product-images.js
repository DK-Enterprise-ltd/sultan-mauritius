// ponytail: one-off. Source product photography in public/Assets/Products
// was uploaded at full camera/mockup resolution (up to 7164x5731, 19MB PNGs)
// for images that render at most ~640px wide on the site, which is most of
// what made product pages slow to load. The untouched originals still live
// in ../reference/Customer upload, so shrinking the public copies in place
// is safe to re-run or reverse from there. Run: node scripts/resize-product-images.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "public", "Assets", "Products");
const MAX_DIMENSION = 1400; // headroom over the largest on-page @2x render size

async function* walk(dir) {
  for (const entry of await fs.promises.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(png|jpe?g)$/i.test(entry.name)) yield full;
  }
}

async function main() {
  let before = 0;
  let after = 0;
  for await (const file of walk(ROOT)) {
    const sizeBefore = (await fs.promises.stat(file)).size;
    const image = sharp(file);
    const meta = await image.metadata();
    if ((meta.width ?? 0) <= MAX_DIMENSION && (meta.height ?? 0) <= MAX_DIMENSION) {
      continue;
    }
    const resized = image.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
    const buffer = await (meta.format === "png"
      ? resized.png({ compressionLevel: 9 })
      : resized.jpeg({ quality: 85 })
    ).toBuffer();
    await fs.promises.writeFile(file, buffer);
    const sizeAfter = buffer.length;
    before += sizeBefore;
    after += sizeAfter;
    console.log(
      `${path.relative(ROOT, file)}: ${(sizeBefore / 1e6).toFixed(1)}MB -> ${(sizeAfter / 1e6).toFixed(1)}MB`
    );
  }
  console.log(`\nTotal: ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB`);
}

main();
