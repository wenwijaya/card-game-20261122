// Ember Duel — make.fun program/v1 entrypoint (Node 22, standard library only).
// The game lives in this directory as plain static files: game/index.html and
// the scripts and styles it loads, with no network request at all. The 3 or 4
// screenshots in screenshots/ are real renders of that code. This program is
// the hand-in: it copies game/ and screenshots/ to the output directory and
// writes dossier.json there with the vendored make.fun library, so the judge
// can read the game, its screenshots and its source outline.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

function repoRoot() {
  return fileURLToPath(new URL(".", import.meta.url));
}

function outputDir() {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function copyEntryFiles(root, out) {
  mkdirSync(out, { recursive: true });
  cpSync(join(root, "game"), join(out, "game"), { recursive: true });
  mkdirSync(join(out, "screenshots"), { recursive: true });
  const shots = join(root, "screenshots");
  if (existsSync(shots)) {
    cpSync(shots, join(out, "screenshots"), { recursive: true });
  }
}

function writeDossier(out) {
  // Caps from the scorer (reference/gate.json): text_max_bytes shapes the
  // dossier text; the rest refuse an entry the scorer would refuse — at most
  // 4 screenshots of 256 KiB, at most 993 game files totalling 48 MiB, and no
  // game path over 1000 bytes, all counted against /output's own 1000-entry
  // cap beside screenshots/ and dossier.json.
  const dossier = buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(out, "dossier.json"), dossier);
}

function main() {
  const root = repoRoot();
  const out = outputDir();
  copyEntryFiles(root, out);
  writeDossier(out);
}

main();
