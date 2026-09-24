// One-time, lossless migration of the existing static repertoire into shared build data.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const source = await readFile(new URL("repertoar.html", root), "utf8");
const decode = (text) =>
  text
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
const pattern =
  /<div class="song-card" data-genre="([^"]+)">\s*<div>\s*<div class="song-title">([^<]+)<\/div>\s*<div class="song-artist">([^<]+)<\/div>/g;
const songs = [...source.matchAll(pattern)].map(([, genre, title, artist]) => ({
  title: decode(title),
  artist: decode(artist),
  genre,
}));
if (
  songs.length !== 174 ||
  songs.filter((song) => song.genre === "bonesaver").length !== 16
)
  throw new Error("Unexpected repertoire; refusing to import.");
await mkdir(new URL("data/", import.meta.url), { recursive: true });
await writeFile(
  new URL("data/repertoire.json", import.meta.url),
  JSON.stringify(songs, null, 2) + "\n",
);
console.log(
  `Imported ${songs.length} songs to ${fileURLToPath(new URL("data/repertoire.json", import.meta.url))}`,
);
