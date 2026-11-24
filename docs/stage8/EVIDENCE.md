# Stage 8 evidence-to-implementation map

This is a design rationale, not proof that Ally Quest itself improves learning.

| Evidence | Finding/constraint | Application | Required further test |
|---|---|---|---|
| Florencia Minuzzi, *Accessibility in Dialogue: A Writer's Story* (GameDeveloper, 2016), https://www.gamedeveloper.com/design/accessibility-in-dialogue-a-writer-s-story | Legible subtitles, player-controlled pacing, short interactions and replayable dialogue support players with different reading speeds | Manually advanced, high-contrast comic bubbles with choice, replay and direct touch controls | Test comprehension and reading time for ages 7–12 |
| *NPC Speech Bubble Component*, QuestForge docs, https://malbersanimations.gitbook.io/animal-controller/malbers-questforge/npc-speech-bubbles/npc-speech-bubble-component | World-anchored proximity prompts can change with mission state | Maya bubble uses physical proximity and story state rather than the instruction HUD | Observe any occlusion, instability or accidental activation |
| Rowe et al., *Integrating learning, problem solving, and engagement in narrative-centered learning environments* (2011), https://scispace.com/papers/integrating-learning-problem-solving-and-engagement-in-mt6kbq4u4k | Narrative decisions can co-exist with problem solving and engagement; study-specific evidence | Dialogue leads to movement-based clue retrieval and a banner handoff, not a standalone quiz | Test actual learning transfer beyond play |
| Habgood & Ainsworth, *Motivating Children to Learn Effectively* (2011), https://scispace.com/papers/motivating-children-to-learn-effectively-exploring-the-value-28biugoiz2 | Intrinsic integration can increase voluntary play and learning in a math learning game | Clues, story, exploration and cooperation become mechanics that move the mission forward | Avoid generalizing subject-specific results; compare against control condition |
| Jandasek et al., *Friends, Family, and Food: Development of a food allergy intervention, F3-App* (2024), https://scispace.com/papers/friends-family-and-food-development-of-a-food-allergy-2tg3g6ebyx | User-centered digital food-allergy content was acceptable and promoted discussion in studied families | Dialogue models including friends and consulting a trusted adult, without prescribing food safety decisions | Specialist review; child-and-caregiver comprehension tests |
| Pete Ellis, *Clever Level Design: More Than Meets the Eye* (2016), https://80.lv/articles/how-to-build-good-levels-for-games | Teach mechanics in isolation, validate comprehension, then combine in challenges | Preserved Stage 7 movement/trampoline layout and introduced only small contextual mission steps | Direct player observation and timings |
| *It might be balanced, but is it actually good?* (2024), https://www.alphaxiv.org/abs/2407.11396 | Algorithmic balancing/playability is not identical to human enjoyment | Automated collision tests are necessary but not sufficient; human study gate remains | Voluntary replay, frustration and novel-player observations |

## Specific safeguards

- Children should never infer that a snack is safe from graphics or peer opinion. In dialogue, Maya says they will ask a trusted adult to check what is safe for each friend.
- No diagnosis or emergency treatment is taught by these lines; future clinical content needs independent review.
- The app has no remote storage, tracking or accounts; only stage state and collected stars are stored in browser localStorage.
- The player can replay dialogue and complete platforming without being assessed on private health status.
