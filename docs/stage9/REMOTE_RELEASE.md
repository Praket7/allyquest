# Stage 9 — GitHub playable release

The Stage 9 playable HTML is hosted on this branch in 22 text fragments due to the GitHub connector's per-request upload size limit. This is not a flattened image. It is the actual executable self-contained HTML including the approved artwork, collision game, comic dialogue, replay medals, daily challenges, audio and accessible options.

Reconstruct the **playable** offline file with Node 22:

```sh
node scripts/assemble-release.mjs
# open play/index.html in Chrome or Safari
```

CI assembles the file and validates key markers and uploads a ready-to-play artifact. For editable TypeScript, tests and game art, use the separate Stage 9 source archive delivered with this release; this branch has **not yet** imported that archive.

### Verification status

Local source: TypeScript build and 60/60 Node tests passed. Local Chromium QA: wide, desktop, laptop and phone story flows passed with no uncaught JavaScript errors. Continuous human/child playtesting and extended real-device performance remain outstanding.

The locked Stage 7 course's `SideWorld.ts` SHA256 is `6038032343da39165544fa658b159b709c1fb33ad01fad66e521d33914d5b2ea`.
