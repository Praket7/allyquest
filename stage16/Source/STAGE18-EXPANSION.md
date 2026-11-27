# Welcome Street — Stage 18 expansion

## Build and play

The original five-adventure Stage 17 release is preserved exactly by `python build.py`. Build the expanded, offline 25-adventure edition with `python build-stage18.py`; open `../Ally_Quest_Welcome_Street_25.html`. `stage18-campaign.py` is the editable authoring source; its deterministic output, `welcome-street-25.json`, can be opened by Content Studio. `stage18-art.js` embeds six newly generated neighborhood illustrations, cropped from the generated concept sheet. The interiors remain real projected geometry with collision footprints, depth ordering, textured surfaces, furniture, fixtures and animated actors; they are not flat AI-generated room images. Existing character sprites, motions and the graph runtime are reused. Twenty new levels have their own scripts, room plans, learning goals, prop sets and safe decision paths. Some share the same renderer, furniture vocabulary and neighborhood art family.

## Design rationale and evidence

- Habgood & Ainsworth (2011), [Intrinsic integration in educational games](https://doi.org/10.1080/10508406.2010.508029): make the learning-relevant action the gameplay. This project uses carrying, separating, examining, rehearsing and asking, rather than attaching a quiz to every level. The mathematics study is not direct evidence that Ally Quest improves allergy knowledge.
- [Microsoft Xbox Accessibility Guideline 109](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/109), [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/full-list/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/): clear objective text, inspectable props, alternate input routes, reduced motion, immediate feedback, explicit map progress. No conformance claim.
- [CDC Food Allergies in Schools](https://www.cdc.gov/school-health-conditions/food-allergies/), [AAP Management of Food Allergy in Schools clinical report](https://doi.org/10.1542/peds.2025-073168), [FARE classroom toolkit](https://www.foodallergy.org/resources/food-allergies-classroom), [FDA Read the Label](https://www.fda.gov/consumers/consumer-updates/have-food-allergies-read-label), [FARE recognizing and responding to reactions](https://www.foodallergy.org/resources/recognizing-and-responding-reaction): individual plans, no food sharing, current labels, adult review, inclusive non-food alternatives, immediate emergency response. Fictional props are not food-safety certification.
- Design comparators: cozy community exploration, character-centered quests, environmental affordances and collecting as optional motivation, rather than reflex difficulty as an educational requirement. Use a small number of interaction verbs consistently; increase complexity through changing social and material context and safe branching.

## Content matrix

| Adventure | Situation and player action |
|---|---|
| 6 Birthday Invitation | Replace exclusionary invitations; separate unverified food; non-food party activity. |
| 7 Bakery Order | Missing information; keep order separate; request review. |
| 8 A Seat at Story Club | Food-free club activities; respect choice to decline. |
| 9 Shared Lunch Tray | Used tray and food sharing; separation; adult-supervised review. |
| 10 Half-Time Together | Equipment, hygiene, inclusive sports activities. |
| 11 Changed Recipe | Current ingredient information; report recipe change. |
| 12 Science Without Surprises | Science materials with food ingredients; reviewed alternatives. |
| 13 Hidden Craft Ingredient | Check craft supplies; hold unverified materials; prepare inclusive crafts. |
| 14 Field Trip Bus | Advance planning; keep emergency plan with responsible staff. |
| 15 Market Mystery | Unclear market label; hold package; report details. |
| 16 Sticky Game Pieces | Prevent cross-contact; adult-directed cleaning and handwashing practice. |
| 17 Rainy Picnic | Relocated celebration; non-food activity and separation. |
| 18 More Than a Joke | Report allergy-related teasing respectfully and make an inclusive plan. |
| 19 A Question at the Cafe | Do not rely on a single claim; communicate current information and equipment concerns. |
| 20 A New Teacher Today | Share procedures without disclosing anyone’s private medical information. |
| 21 Speak Up Right Away | Fictional possible reaction: immediate adult/emergency help, no investigation prerequisite or time score. |
| 22 Fairground Plan | Replace proposed food prizes with non-food rewards. |
| 23 Festival Supply Mix-up | Document unknown equipment use; separate utensils and tray. |
| 24 Welcome Rehearsal | Offer music and non-food participation; practice rhythm. |
| 25 Everyone Belongs | Integrative festival capstone: label uncertainty, separation, hygiene, inclusive activity, adult review. |

## Automated verification

`node stage18-tests.cjs` checks all 25 level records, the 31 rooms, 162 new graph states, 172 edges and all 61 terminal routes. It rejects incorrect destinations, incomplete gesture counts and advancement before responsible adult guidance; every completed route ends in adult consultation. `stage18-qa.py` begins each new level independently via a QA start-level hook, then uses normal movement, dialogue, room entry, pointer or accessible object control, exit, and finish interactions. It never force-completes tasks. `stage18-map-qa.py` uses a storage stub in the restricted local browser; `stage18-native-qa.py` is for an unrestricted CI runner. Existing five-level Stage 17 output matches SHA-256 ffbe1c0e59b23ab9ddc3eac452928e8d1d1bc304cdfc63257c02a87dc2699976 exactly. The expanded build retains the Stage 17 clinical review requirements.

## Limits

The 20 new chapters still require independent clinical review, child usability testing, and real-device testing. Headless Chromium screenshot and functional evidence does not establish professional human-rated art quality, enjoyment, educational efficacy, WCAG compliance, or GPU performance on a particular device. The game intentionally does not diagnose, prescribe, authorize eating or use real food/medication. No full 25-level continuous session was run locally; new levels were tested in isolation and Stage 17 has separate continuous-campaign evidence. The final map/count and emergency-result refinements were retested with selected affected cases. The new outdoor paths use optional simple platforming rather than hazardous timed gates; the interior geometry is 2.5D canvas rendering, not a navigable free-camera 3D engine.
