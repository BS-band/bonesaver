import http from "node:http";
import { createReadStream } from "node:fs";
import { realpath, stat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const root = await realpath(
  option("--root", fileURLToPath(new URL("../", import.meta.url))),
);
const port = Number(option("--port", "4174"));
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid preview port.");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};
const insideRoot = (file) => {
  const relative = path.relative(root, file);
  return (
    relative !== ".." &&
    !relative.startsWith(".." + path.sep) &&
    !path.isAbsolute(relative)
  );
};

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Bonesaver-Preview", "local-only");
  res.setHeader("Cache-Control", "no-store");
  const reply = (status, text) => {
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(req.method === "HEAD" ? undefined : text);
  };
  const notFound = async () => {
    try {
      const html = await readFile(path.join(root, "404.html"));
      res.writeHead(404, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": html.length,
      });
      res.end(req.method === "HEAD" ? undefined : html);
    } catch {
      reply(404, "Not found.");
    }
  };
  if (!["GET", "HEAD"].includes(req.method)) {
    res.setHeader("Allow", "GET, HEAD");
    return reply(405, "Preview only accepts GET and HEAD.");
  }
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://127.0.0.1").pathname,
    );
    if (pathname === "/robots.txt")
      return reply(200, "User-agent: *\nDisallow: /\n");
    const parts = pathname.split("/").filter(Boolean);
    if (
      parts[0]?.startsWith("_") ||
      parts.some((part) => part.startsWith(".") || /[\\:\0]/.test(part))
    ) {
      return notFound();
    }
    const relative = parts.length ? parts.join("/") : "index.html";
    const extension = path.extname(relative).toLowerCase();
    if (
      !types[extension] ||
      (parts.length > 1 && !["assets", "img", "fonts"].includes(parts[0]))
    ) {
      return notFound();
    }
    const file = await realpath(path.resolve(root, relative));
    if (!insideRoot(file)) return notFound();
    const info = await stat(file);
    if (!info.isFile()) return notFound();
    res.setHeader("Content-Type", types[extension]);
    res.setHeader("Accept-Ranges", "bytes");
    let start = 0;
    let end = info.size - 1;
    let status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) {
        res.setHeader("Content-Range", `bytes */${info.size}`);
        return reply(416, "Invalid range.");
      }
      if (match[1]) {
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), end) : end;
      } else {
        start = Math.max(0, info.size - Number(match[2]));
      }
      if (start >= info.size || end < start) {
        res.setHeader("Content-Range", `bytes */${info.size}`);
        return reply(416, "Invalid range.");
      }
      status = 206;
      res.setHeader("Content-Range", `bytes ${start}-${end}/${info.size}`);
    }
    res.setHeader("Content-Length", info.size === 0 ? 0 : end - start + 1);
    res.writeHead(status);
    if (req.method === "HEAD" || info.size === 0) return res.end();
    const stream = createReadStream(file, { start, end });
    stream.on("error", () => res.destroy());
    res.on("close", () => stream.destroy());
    stream.pipe(res);
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof URIError) reply(400, "Invalid URL.");
      else await notFound();
    } else res.destroy();
  }
});
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`BoneSaver local preview: http://127.0.0.1:${port}`);
  console.log(`Files: ${root}`);
  console.log("Local computer only. No deployment. Stop with Ctrl+C.");
});
