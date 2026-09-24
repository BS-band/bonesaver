// Optional regeneration tool. Requires sharp (development only); generated assets are committed.
const sharp = require("sharp");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
async function main() {
  const output = path.join(root, "img", "optimized");
  await fs.mkdir(output, { recursive: true });
  const photos = [
    "hero-background3.JPG",
    "band-photo-1.JPG",
    "band-photo-2.JPG",
    "member-MBE.JPG",
    "member-ALH.JPG",
    "member-DSST.JPG",
    "member-DSML.JPG",
    "member-PAD.JPG",
  ];
  for (const filename of photos) {
    const name = path.parse(filename).name.toLowerCase();
    const member = name.startsWith("member-");
    for (const width of member ? [240, 480] : [640, 1200]) {
      await sharp(path.join(root, "img", filename))
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(path.join(output, `${name}-${width}.webp`));
    }
  }
  await sharp(path.join(root, "img", "favicon.png"))
    .resize(48, 48)
    .png()
    .toFile(path.join(output, "favicon-48.png"));
  await sharp(path.join(root, "img", "favicon.png"))
    .resize(180, 180)
    .png()
    .toFile(path.join(output, "apple-touch-icon.png"));
  await sharp(path.join(root, "img", "logo.jpg"))
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 87 })
    .toFile(path.join(output, "logo.webp"));
  await sharp(path.join(root, "img", "hero-background3.JPG"))
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 86 })
    .toFile(path.join(output, "social.jpg"));
  console.log("Optimized existing images; originals preserved.");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
