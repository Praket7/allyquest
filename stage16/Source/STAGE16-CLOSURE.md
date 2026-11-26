# Stage 16 closure: authoring and verification

## Build and author

Requires Python 3.10+, Node 18+ (CI uses Node 22 and Python 3.12). The existing five-level campaign stays in `content.json`; its specialized activity handlers are preserved as compatibility code. All new graph rooms use the generic graph runtime.

```sh
python make-branch-demo.py
node validate-content.cjs
node content-tests.cjs
node graph-tests.cjs
python build.py
python build-editor.py
python build.py branch-demo-content.json ../Ally_Quest_Stage16_Branch_Demo.html
```

Open Content Studio, select **Load branching demo**, and use **Quest graphs · NPC policies · room archetypes**. Draft graph states/transitions can be edited independently until **Apply validated graph**. The NPC and theme panels accept structured JSON. Export a validated pack; build it with `python build.py path/to/allyquest-content.json ../custom.html`. The demo has its own save namespace and six unlocked adventures. A graph can use `use`, `move` (portable item and destination), `gesture` (bounded repeats), or `consult` (designated adult). The graph authoring model allows converging/diverging paths, cycles with an exit, and multiple terminal states, but disallows two actions with the same source object at a node because the point-and-click UI cannot disambiguate them. No executable actions or arbitrary external calls. New archetypes use material palettes, wall fixture primitives (window, panel, shelf, plant), standard object models, furnishings and collision footprints. New prop rendering primitives or an entirely new game mechanic still require engine code. `make-branch-demo.py` is a reproducible content-only example with a new room ID and archetype, not a new room-ID handler.

NPC profiles specify weighted eligible goals, speed, dwell, optional target, optional graph-node condition, and a fallback. NPCs do not approve food decisions. Terminal transitions must consult the designated responsible adult. Emergency graph rooms immediately consult that adult with no other prerequisite. These are structural educational guardrails, not medical validation; all content is marked pending specialist review.

## Browser verification

```sh
pip install playwright==1.51.0 pillow==11.2.1
python -m playwright install --with-deps chromium
export AQ_CHROMIUM=$(python -c 'from playwright.sync_api import sync_playwright; p=sync_playwright().start(); print(p.chromium.executable_path); p.stop()')
python build.py demo-content.json ../Ally_Quest_Stage16_Demo.html
python run-qa.py
python graph-browser-qa.py
python graph-editor-qa.py
python build.py qa/graph-editor-export.json ../Ally_Quest_Stage16_Authored_Demo.html
python graph-browser-qa.py --authored
python graph-browser-qa.py --touch
python profiler-qa.py
python visual-regression.py /path/to/previous/Ally_Quest_Stage155.html
python device-performance.py
```

The visual suite compares the home/map, every exterior, and every interior at desktop, portrait, landscape, and both touch-emulated orientations. QA positioning is for scene snapshots only, not evidence of gameplay completion. Pairwise captures use the same browser, viewport, reduced-motion preference and random seed. Screenshots and per-pair reports are exported; tolerance: <=8% pixels with a max channel difference >25 and mean absolute RGB difference <=4. Visual samples are not proof of every possible animated state. Headless timings are indicative and host-dependent; the 4x CPU-throttled profiles are not real devices. Static touch-device raster caches retain geometry, hit regions, labels, and live animations. The CI job's frame-pacing guardrails are intentionally separate from physical-device acceptance.

## Real-device qualification (requires access to target hardware)

Copy the exact release to `Ally_Quest_Stage16_Complete.html` and copy `device-profiler.html` beside it. Serve that directory with `python -m http.server 8000 --bind 0.0.0.0` on a trusted local network, then open the profiler from the target device using the host's local IP (not a public deployment). The recorder operates on the same-origin embedded game; it records rAF intervals, input-to-next-rAF scheduling, and long tasks where the browser supports the API. Input-to-next-rAF is a proxy, not end-to-end display latency. No report is automatically uploaded. Label the device and record 30 seconds of normal exterior play and 30 seconds of normal interior play in each applicable orientation. Repeat three times, after warming up, while unplugged and without power-saving mode. Check rotation, touch controls, audio, offline persistence, interaction and quest completion manually. Export each JSON and retain device/browser version, orientation and game hash. Proposed target: median <=33.4 ms, p95 <=50 ms, no repeated >100 ms stalls, no input lockouts, no clipping or crashes. This is a proposed acceptance criterion, not an achieved physical-device result. If actual hardware is unavailable, report the gate as pending.
