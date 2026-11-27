# Stage 19 inspection studio — engineering continuation

Baseline: PR #8 head b3fe057fe0cf64eaee08273bd1c3ee7e6d59cf2f, six successful workflows (Stage 19 campaign run 46078412237; reference packshot acquisition run 46078412233). This change is deliberately on the existing stacked feature branch, not main. Inspect exact head and CI again before merging.

## Scope
The new presentation-only module loads after scenic finish. It decorates the native label dialog, leaving the existing case, graph, mark, decision and submission handlers authoritative. The original map, title, physics, interiors and saved progression are unchanged. Desktop retains the warm scene and a single paper surface. Portrait reflows to a single scrolling workspace, with a compact product preview on the ingredients view, an enlarge control, and a stable footer. No external requests are needed for the embedded photos.

## Assets and evidence
The eight retailer reference packshots are the original WebP captures from the acquisition workflow, with source URLs and SHA-256 fields in stage19-retail-packshots.js. They are approximately 300 pixels square, not current front/back batch evidence. All eight were visually inspected. TCIN 51426307 is the lightly salted barbecue variant according to Target's listing and PepsiCo SmartLabel UPC 028400632423; update the displayed name, not the assessment rules. Missing ingredient records never receive a retail image. The recipe illustrations remain explicitly labeled, not publisher photography. No product endorsement. Confirm permission for public distribution or replace with licensed/own photos before release; the retailer's public listing is not a reuse license. Keep source snapshots and lot/receipt simulation separate.

## Research and application
- Nintendo Kirby developer interview, part 2: https://www.nintendo.com/en-ca/whatsnew/ask-the-developer-vol-4-kirby-and-the-forgotten-land-part-2/ — framing and gameplay should work together; keep the object and action visually related.
- Nintendo Mario Wonder: https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-11-super-mario-bros-wonder-part-1/ — meaningful discovery rather than decoration.
- Xbox XAG 101, 107, 112: https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/ — text size, input targets and predictable UI navigation. Use 44px target design goal and reflow; not certification.
- Naughty Dog: https://www.naughtydog.com/blog/the_last_of_us_part_ii_accessibility_features_detailed — optional magnification and visual clarity; adapt to small touchscreens.
- WCAG 2.2 https://www.w3.org/TR/WCAG22/ — reflow and contrast as test targets; independent audit still required.
- Habgood and Ainsworth 2011 https://doi.org/10.1080/10508406.2010.508029 — learning embedded in the action itself; retain evidence selection rather than a decorative quiz.
- FDA https://www.fda.gov/consumers/consumer-updates/have-food-allergies-read-label — labels change; no food approval based on game evidence.
- Open Food Facts photo license https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/ — a possible future source of licensed photography, verify exact variant and attribution.
- Target https://www.target.com/p/-/A-51426307 and https://smartlabel.pepsico.info/028400632423-0015-en-US/index.html — variant correction.

## Build / tests
From stage16/Source run python build-stage19.py, node stage19-tests.cjs, python stage19-reference-qa.py, python stage19-studio-qa.py. Set AQ_CHROMIUM to installed Chromium, AQ_STAGE19_HTML to exact standalone if needed. Studio QA exercises the three base investigations (13 product/recipe records), photo selection, enlarge, four viewport profiles, Escape, evidence and submit. It uses opt-in QA position setup and real DOM actions; not uninterrupted human playthrough. See Actions navigation artifact for screenshots. Keep all prior suites. If CI fails, inspect logs, fix actual defect, rerun exact head; do not suppress tests.

## Next priorities
1. Confirm current head and every required remote job; check actual screenshots for overflow, focus order, correct photo and ingredient contrast. Test real iOS Safari / Android and Chromebook, portrait keyboard, rotation and reduced motion.
2. Obtain rights-cleared high-resolution package front/back photos and published recipe photography with variant, UPC, capture date, license, source and checksums; capture actual label evidence and independent clinical review. Do not replace missing evidence with a plausible image. 300px references have limited zoom.
3. Consolidate successive CSS presentation layers into a single maintained component; add visual baseline comparisons at 320x568, 390x844, 844x390 and 1440x810. No changes to clinical rules without review.
4. Continue Stage 20 release qualification: specialist review, approved child usability playtests, meaningful variety across template families, real-device performance, offline persistence, rights/privacy and hosting. Do not claim premium parity or clinical validation from screenshot smoke tests.
