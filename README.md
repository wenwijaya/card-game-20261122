# 🔥 Ember Duel

[![make.fun](https://make.fun/badge.svg)](https://make.fun/c/best-card-game-20261122-1826)

A complete, original tactical card battler that plays offline in a desktop browser. You are the Ember Knight; your rival is the Cinder Warden. Reduce the Warden from **30 life to 0** before yours reaches 0.

## How it plays

- **Mana grows each turn** (up to 10). Cards cost mana to play; you draw a card every turn.
- **Fighters stay on the table** and attack once per turn. A fighter cannot attack the turn it is played — unless it is **Swift**.
- **Four elements**, told apart by colour *and* icon: 🔥 Flame (red) beats 🍃 Leaf (green), 🍃 Leaf beats 🪨 Stone (grey), 🪨 Stone beats 💧 Tide (blue), 💧 Tide beats 🔥 Flame. Attacking a weaker element deals **+2 damage**.
- **Guard** fighters must be attacked first. **Ember** deals 1 damage when played. **Heal** restores life when played.
- **The Cinder Warden AI** plays its best cards, trades up when it wins the exchange, and goes for lethal when it sees it. An empty deck deals 1 fatigue damage per draw, so no game stalls.

## Controls

- **Mouse:** click a hand card to select it, click again (or press Enter) to play it. Click one of your fighters, then an enemy fighter — or the Warden's life — to attack. **End Turn** button, or `N`.
- **Keyboard:** `1–5` select a hand card, `Enter` plays it, `A` / `Tab` arms an attacker, `N` ends turn, `M` toggles sound, `H` help, `Esc` cancels.

## Run it

No build step, no network. Serve `game/` with any static server and open `game/index.html` in desktop Chrome:

```sh
node serve.ts        # http://localhost:8080
```

Screenshot demo states (the same states the screenshots were taken from): `?shot=title`, `?shot=table`, `?shot=win`, `?shot=loss`.

## Layout

- `game/index.html` — page shell, title / help / win / loss overlays
- `game/styles.css` — felt table, gold trim, legible cards
- `game/src/cards.js` — the 16-card pool: elements, costs, attack, health, traits
- `game/src/deck.js` — deck building, shuffling, drawing
- `game/src/engine.js` — state, turns, combat, traits, win/loss
- `game/src/ai.js` — the Cinder Warden: card plays, trades, lethal
- `game/src/render.js` — heroes, hands, boards, log, screens
- `game/src/shots.js` — deterministic demo states for screenshots
- `game/src/main.js` — bootstrap, mouse + keyboard input, sound
- `main.ts` — make.fun program/v1 entrypoint: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`

## Entry

Built for the make.fun bounty **“Make the best card game”** (`best-card-game-20261122-1826`). Referral: `de3tegw5`.
