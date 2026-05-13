# Plan

## Goal
Build a quiz-style web app with 10 questions (A/B/C/D choices), 16 outcomes, and 12 comments. Each choice adds weight to one or more outcomes. The final result depends on accumulated weights.
Visual direction: minimalist, satirical.

## Inputs Needed
- Detailed mapping of each question option to outcome weights (from the PDF).
- Source PDF: D:\课程\智能视觉工程设计\code\Failure游玩内容.pdf (provided).
- Outcome definitions (name, description, assets if any).
- Comment pool rules (how comments are selected for outcomes) and the full set of 6 comment texts (confirmed no expansion).
- UI/visual direction (tone, color, typography, layout). (Confirmed: minimalist, satirical.)

## Assumptions (TBD)
- Single-page app with no build step (HTML/CSS/JS).
- Data-driven config in JSON for questions, outcomes, and comments.
- Results use rule-based outcome triggers; highest trigger score wins.
- If ties, choose a random outcome among the tied set.
- Question flow: one-by-one wizard.
- Allow back-navigation to edit previous answers.
- Restart button shown only on the final result view.
- Show progress indicator (e.g., "3 / 10") on question screens.
- Include an intro/start screen before Q1.
- Result page includes shareable content (copy text + save image).

## Questions (to be answered one by one)
1) (Answered) Shareable content includes both copyable text and downloadable image.

## Milestones
1) Confirm data model and rules (weights, tie-break, comments selection).
2) Build static UI shell (start, question flow, result view).
3) Implement scoring engine and result mapping.
4) Populate data from PDF and verify totals.
5) Polish UX and copy.

## Notes from PDF (parsed)
- Attributes: 卷 / 躺 / 虚 / 焦 / 念; each option adds weights to these.
- 10 questions and option-weight table extracted into weights-section.txt.
- 16 outcome labels with trigger conditions and descriptions identified (needs formatting).
- Comment section shows 6 unique lines; duplicates are ignored per user.

## Deliverables
- index.html
- styles.css
- app.js
- data/questions.json
- data/outcomes.json
- data/comments.json
