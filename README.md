# Ally Quest — Stage 9

**Ally Quest** is an illustrated 2.5D side-scrolling game for K12Allergies. Stage 9 expands the Welcome Street banner adventure with smoother animation, spring and landing reactions, a gentler camera, environmental animation, original audio, replay medals, voluntary daily challenges, and accessibility options.

## Play the offline build

This repository stores the **self-contained, playable Stage 9 HTML** as 22 source fragments to work around the connected GitHub API's per-request file limit. GitHub Actions reconstructs the exact verified HTML artifact.

```bash
node scripts/assemble-release.mjs
# Then open play/index.html in a browser.
```

A verified GitHub Actions run uploads `play/index.html` as the `ally-quest-stage9-offline-html` artifact. The reassembly script checks its SHA-256 against the tested release.

## Scope and transparency

- **In GitHub:** the complete executable standalone game payload, reconstruction script, release notes, and CI verification.
- **In the separate source archive delivered in ChatGPT:** the original editable TypeScript modules, image assets, documentation, unit tests and build scripts. This editable source has **not** been imported to GitHub yet.
- **Local checks:** 60/60 automated tests, four desktop/mobile browser flow checks without JavaScript errors. The same local source rebuilt successfully from a clean extracted directory.
- **Locks:** Stage 7 obstacle coordinates/physics and approved home artwork were unchanged in the Stage 9 source.
- **Not established:** child playtesting, real-device performance across browsers, and medical specialist approval.

Read [Stage 9 release details](docs/stage9/REMOTE_RELEASE.md). We recommend importing the editable TypeScript archive before active multi-person development and then running its `npm run check` suite in GitHub CI.
