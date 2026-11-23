# Ally Quest

**A playable, illustrated 2.5D side-scrolling adventure for K12Allergies.**

Welcome Street contains real collision-based movement, physics-driven trampolines and moving platforms, hand-drawn scenery, the Ally Crew, and a banner-rescue mission. Stage 8 introduces a world-anchored comic conversation with Maya, choice-based dialogue, saved story/checkpoint progress, optional secrets, and a four-character celebration.

## Run locally

```bash
npm install
npm run check
npm run dev
```

Open `http://localhost:4173`. To produce the standalone offline HTML, run `python scripts/build-standalone.py` after `npm run build`.

## Development standards

- Approved Stage 7 home markup and game obstacle physics are locked by automated tests.
- Source modules live under `src/`; local game artwork is under `web/assets/`.
- No trackers, accounts, or remote collection of children's information are required for gameplay.
- Educational dialogue requires specialist review before public learning-outcome claims.

## Current release

Stage 8: Welcome Street — The Banner Quest. See `docs/stage8/RELEASE.md`, `docs/stage8/EVIDENCE.md`, and `docs/stage8/PLAYTEST.md`.

The game has automated and browser QA, but has **not** undergone independent child playtesting or specialist medical review.
