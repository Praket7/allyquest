# Ally Quest: Stage 8 — The Banner Quest

Status: playable browser implementation, not yet child-validated / medically certified.

## Locked approved systems

- Stage 7 home markup, home CSS and illustrated home assets are unchanged.
- `src/game/physics/SideWorld.ts` SHA256: `6038032343da39165544fa658b159b709c1fb33ad01fad66e521d33914d5b2ea`.
- Trampoline barriers, platforms, springs, rope bridges and base movement parameters retain their approved coordinates and collision physics.

## Changes

1. Replaced the old Canvas `E TALK` placard with a responsive DOM comic speech balloon anchored to Maya using camera-world projection. The bubble doubles as the interaction affordance and dialogue presenter. It has a little tail, close affordance, short readable lines, two choice options, and E/Enter/Space or touch to continue.
2. Dialogue pauses physics safely and resumes after its completion. The top objective strip never displays Maya's lines.
3. `WelcomeQuest`/`QuestStore`: distinct, versioned local save; objective states; remembered Maya encounter; creek clue; banner pickup; two secrets; checkpoint recovery and completion/reset lifecycle. No identities, accounts, network calls or analytics.
4. A visible banner near the end of Welcome Street can be found by physically reaching the garden, and is visually carried into the finale. Optional collectibles are also rendered in world space, not as fake completion UI.
5. The finale shows stars, secret counts, the recovered banner, and all four approved character portraits; replay/home actions remain available.
6. Small original synthesized ambient melody and additional notification tones. Audio starts after the player's first explicit user interaction and respects mute.
7. Preserved responsive touchscreen and keyboard controls, reduced-motion support, real moving-platform physics and camera.

## Source layout

```
src/main.ts                      home wiring and progress awards
src/home/                      approved art (unchanged)
src/state/saveData.ts          permanent earned-star progress
src/game/GameHost.ts           gameplay lifecycle/event orchestration
src/game/story/WelcomeQuest.ts quest model and privacy-aware persistence
src/game/story/ComicBubble.ts  comic dialogue UI; independent of Canvas
src/game/audio/AmbientScore.ts original WebAudio score
src/game/physics/              deterministic movement and obstacles (locked)
src/game/render/               sprite art, world coordinates and scene rendering
web/assets/css/game.css       responsive comic & mission presentation
scripts/build-standalone.py   embeds artwork and compiled JavaScript
```

## Reproducibility

```
npm run check
python scripts/build-standalone.py
```

The standalone build contains every graphical asset and does not require a server, package installation, CDN, or internet access to run. The modular `web/` build uses local assets and can be served with `npm run dev`.

## Verification and limitations

- 52 existing/new Node automated tests; verified fixed geometry and unmodified approved home source.
- Browser checks at 1728×888, 1366×768, and 390×844 verify E dialogue, player choice, quest objectives, banner, completion, and absence of uncaught exceptions.
- Browser tests use deterministic position injection for visual scene coverage and quest state; separate legacy physics tests cover continuous movement, bounce necessity, platform interactions, and checkpoint behavior. These are not human playtests.
- Food-allergy safety language is deliberately general and requires review from a qualified pediatric allergy/school-health adviser before public educational claims.
- No real-child study, accessibility expert review, iOS Safari test, field performance evaluation or independent safety evaluation has been completed. Do not call this a shipped product.
- `Praket7/allyquest` remote status is separately tracked; local artifact availability does not imply GitHub import or deployment.
