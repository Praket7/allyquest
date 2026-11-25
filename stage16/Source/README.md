# Ally Quest Stage 16 — content engine

Canonical source: `base/` contains editable exterior template, stylesheet, artwork data, original scene data, renderer, and controller. The existing interior mechanics remain in separate domain modules. `content.json` is the runtime authority for five exterior maps, eleven interiors, 113 objective steps, furniture geometry, objects, collision references, story, lessons, incident descriptions, and NPC routine data. `runtime-content.js` hydrates fresh reference graphs before visits. The old room constructors remain as migration/comparison code until their special-case handlers can be fully generalized. Do not treat them as the authoring source.

## Build and author

Requires Node 22+ and Python 3.12+; no game runtime network dependencies.

```
node content-tests.cjs
python build.py
python build-editor.py
python build.py demo-content.json ../Ally_Quest_Stage16_Demo.html
```

Open `../Ally_Quest_Stage155.html` for the original campaign; open `../Ally_Quest_Content_Studio.html` for the visual authoring editor. Export a validated JSON pack and use `python build.py /path/to/allyquest-content.json ../custom.html`. An isolated demonstration pack includes a sixth exterior with a reused mural-room template and separate save namespace, unlocked for testing. It is not an additional published campaign chapter. The production campaign remains five levels.

The editor supports selecting and moving floor and surface objects, furniture and linked collision footprints, exterior platforms/doors/stars/finish locations, adding non-food props and basic geometry, removing unreferenced objects, cloning exterior levels, editing step instructions, undo, import and export. Advanced JSON enables editing data not yet represented by visual controls. Structural validation is intentionally not medical or educational certification. Gameplay implementation of specialized action types and authored incidents remains in the compatibility layer; creating entirely novel mechanics requires code.

## Tests

Install Playwright and Chromium, set AQ_CHROMIUM if not at `/usr/bin/chromium`, then run `python run-qa.py`. Existing harnesses use exact HTML bytes and a browser-local storage stub. The campaign driver uses normal keyboard and pointer actions with read-only QA telemetry; individual room suites can use QA starting positions. The editor uses actual browser input and file-download assertions. Node checks verify structure, object-reference identity, invalid content rejection and geometry edit consistency. `run-qa.py` checks report counts and errors, because legacy test scripts can return exit 0 after catching failures. The old two-choice `allergy_qa.py` is historical and superseded by `simulation_qa.py`.

## Educational boundary

No game content certifies food as safe. Ordinary incidents require authored adult-reviewed resolution. Possible reaction drill requires immediate adult help, no timed score or investigation prerequisite. Every room carries a pending-specialist review status; structural validation cannot establish clinical correctness or learning outcomes. Do not publish medical claims before independent specialist and human usability review.
