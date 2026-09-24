// Refreshes public thumbnails and self-hosted open fonts; never downloads YouTube videos.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const root = path.resolve(__dirname, "..");
const videos = [
  {
    id: "_o0jpleViPc",
    title: "BoneSaver naživo: BuďFit Fest a firemní akce",
    description:
      "Sestřih vystoupení kapely BoneSaver. Rock, pop a saxofon v živém provedení.",
  },
  {
    id: "JUKIvB2jqek",
    title: "Firemní akce ve Chvojenci",
    description: "BoneSaver na firemní akci ve Chvojenci.",
  },
  {
    id: "YSnUYWsLxFI",
    title: "Čarodějnice v Heřmanově Městci",
    description:
      "Živá hudba kapely BoneSaver při venkovní akci v Heřmanově Městci.",
  },
  {
    id: "Fw7ngvaUUqs",
    title: "Máma táta — Hudba Praha",
    description: "Skladba skupiny Hudba Praha v živém podání kapely BoneSaver.",
  },
  {
    id: "lil5aHN9Bg4",
    title: "Should I Stay or Should I Go — The Clash",
    description: "Skladba The Clash v živém podání kapely BoneSaver.",
  },
  {
    id: "Gnbw8LCBmAc",
    title: "Špinavý záda — Hudba Praha",
    description: "Živý záznam skladby Hudby Praha v podání kapely BoneSaver.",
  },
];
async function get(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    },
  });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}
async function fonts() {
  const folder = path.join(root, "assets/fonts");
  await fs.mkdir(folder, { recursive: true });
  const css = await (
    await get(
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..700&family=Space+Grotesk:wght@500..700&display=swap",
    )
  ).text();
  const blocks = [
    ...css.matchAll(/\/\* (latin(?:-ext)?) \*\/\s*(@font-face\s*\{[^}]+\})/g),
  ];
  if (!blocks.length)
    throw new Error("Google Fonts did not return Latin WOFF2 subsets.");
  const downloaded = new Map();
  let localCss =
    "/* Self-hosted Google Fonts, SIL Open Font License. See adjacent license files. */\n";
  for (const [, subset, block] of blocks) {
    let localBlock = block;
    for (const [, url] of block.matchAll(/url\((https:[^)]+)\)/g)) {
      if (!downloaded.has(url)) {
        const name = `font-${downloaded.size + 1}.woff2`;
        await fs.writeFile(
          path.join(folder, name),
          Buffer.from(await (await get(url)).arrayBuffer()),
        );
        downloaded.set(url, name);
      }
      localBlock = localBlock.replace(
        url,
        `/assets/fonts/${downloaded.get(url)}`,
      );
    }
    localCss += `/* ${subset} */\n${localBlock}\n`;
  }
  await fs.writeFile(path.join(folder, "fonts.css"), localCss);
  for (const family of ["plusjakartasans", "spacegrotesk"]) {
    await fs.writeFile(
      path.join(folder, `${family}-OFL.txt`),
      await (
        await get(
          `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`,
        )
      ).text(),
    );
  }
  console.log(`Self-hosted ${downloaded.size} font subsets.`);
}
async function videoMedia() {
  await fs.mkdir(path.join(root, "img/videos"), { recursive: true });
  for (const video of videos) {
    const bytes = Buffer.from(
      await (
        await get(`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`)
      ).arrayBuffer(),
    );
    // Standard hqdefault has 45px letterboxing above/below its 480x270 picture.
    await sharp(bytes)
      .extract({ left: 0, top: 45, width: 480, height: 270 })
      .webp({ quality: 86 })
      .toFile(path.join(root, `img/videos/video-${video.id}.webp`));
    try {
      const html = await (
        await get(`https://www.youtube.com/watch?v=${video.id}`)
      ).text();
      const date = html.match(/"uploadDate":"([^"\s]+)"/)?.[1];
      const seconds = html.match(/"lengthSeconds":"(\d+)"/)?.[1];
      if (date && /^\d{4}-\d{2}-\d{2}/.test(date)) video.uploadDate = date;
      if (seconds) video.duration = `PT${Number(seconds)}S`;
    } catch (error) {
      console.warn(
        `Optional metadata unavailable for ${video.id}: ${error.message}`,
      );
    }
    console.log(
      `${video.id}: thumbnail saved, date ${video.uploadDate || "unconfirmed"}, duration ${video.duration || "unconfirmed"}`,
    );
  }
  await fs.mkdir(path.join(root, "_dev/data"), { recursive: true });
  await fs.writeFile(
    path.join(root, "_dev/data/videos.json"),
    JSON.stringify(videos, null, 2) + "\n",
  );
}
Promise.all([fonts(), videoMedia()]).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
