// Ember Duel — tiny local static server for play-testing game/.
// Serves game/ at http://localhost:8080 with no network dependency.
//   node serve.ts
// Then open http://localhost:8080 in desktop Chrome. Add ?shot=title,
// ?shot=table, ?shot=win or ?shot=loss to jump straight to a demo state
// (the same states the screenshots were taken from).

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "game");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost:8080");
    let path = normalize(join(root, decodeURIComponent(url.pathname)));
    if (!path.startsWith(root)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    if (path.endsWith("/")) path = join(path, "index.html");
    if (!existsSync(path) || !statSync(path).isFile()) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(readFileSync(path));
  } catch (err) {
    res.writeHead(500);
    res.end("error");
  }
});

server.listen(8080, () => {
  console.log("Ember Duel at http://localhost:8080");
});
