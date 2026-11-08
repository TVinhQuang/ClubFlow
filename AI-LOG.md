# AI assistance log

This log records assistant involvement in the current ClubFlow handoff. It does not attribute assistant-generated code to a human team member. The team owns the submitted result and must be able to explain it. Earlier prompts, manual edits or checks are not reconstructed without evidence.

## 2026-11-08 — Screen 2 (Application Review) Implementation by Lê Tấn Thành

Tool: Antigravity.

Asked for: Implement Screen 2 (Application Review) completely for Lê Tấn Thành (24127540) within `applications.html`, adhering strictly to `AGENTS.md` and PA2 rubric requirements.

Kept: Shared shell, tokens, typography, and sticky 3-step navigation. Connected Screen 2 to published campaign data via `campaignStore`. Maintained single `h1`, responsive design, and full static HTML generation for JavaScript-disabled accessibility.

Changed: Implemented `src/features/applications/seed.js`, `store.js`, `view.js`, `index.js`, and `src/styles/applications.css`. Added status filtering, search by name/studentId/code, review note persistence in `localStorage`, CV preview modal, CSV export, and link to `schedule.html`. Connected `getApplications()` adapter in `src/app.js` to preserve application-position dependencies. Added 4 unit tests in `tests/applications.test.js` (total 23 tests).

Rejected: Using generic or un-namespaced CSS classes; covering the application list on tablet/desktop with the detail panel (resolved by side-by-side flex layout with independent scroll and clear mobile back button); inventing external server endpoints.

Caught and Fixed:
- Check error: `npm run check` reported `AssertionError: applications.html: duplicate IDs (31 !== 35)` on generated `applications.html`.
- Cause: Detail panel buttons and fields used `data-id="${candidate.id}"`, which matched the check script's regex `\bid="` due to the `-` boundary, flagging multiple elements with `HS-001`.
- Fix: Renamed attributes to `data-app` and `data-row-app` to avoid false-positive ID matching while retaining data attributes for event delegation. Re-ran `npm run generate` and `npm run check`; all 7 pages passed with zero errors.

Verification: All 23 automated tests passed (`npm test`). Structural checks passed (`npm run check`). Static build succeeded in `dist/` (`npm run build`). Dev server serves `applications.html` with HTTP 200.

## 2026-11-08 — Self-contained PA2 documentation correction

Tool: OpenAI Codex.

Asked for: Explain and correct references to an unavailable local demo folder and the inclusion of unrelated PA1 sports wireframes in the PA2 repository.

Kept: The implemented PA2 application, shared layout, team ownership and existing validation evidence.

Changed: README, rules, prototype description and implementation plan now identify the UI sources inside this repository. Removed the copied sports-topic wireframes from the current repository tree. The original files outside this repository were preserved.

Rejected: Treating a local demo folder as a usable reference for teammates who clone this repository; including unrelated historical images in the working PA2 code handoff. Prior prompts remain verbatim for traceability.

By hand: The user identified the scope and documentation problem. No team-authored code is attributed to this correction.

Verification: Documentation and repository-scope checks are recorded with this correction; HTML/application sources are unchanged, so the retained W3C evidence remains applicable.

## 2026-11-08 — Accepted handoff, W3C validation and GitHub request

Tool: OpenAI Codex, with collaborating assistant agents.

Asked for: Verify the completed pages with W3C and push the completed work to <https://github.com/TVinhQuang/ClubFlow> so the other team members can continue.

By hand: Quang reported that he had tested and checked everything and accepted the handoff. This is the user's reported review; no screenshot capture, viewport dimensions or additional team-authored code is inferred from it.

Changed: Updated the current review gate and handoff documentation to record the acceptance and explicit authorization for W3C validation and the current commit/push to `origin/main`. The earlier request to defer W3C validation is superseded. Replaced the shared favicon's invalid data URI with the local `assets/favicon.svg`. B/C feature content remains blank for its assigned owners, and the full PA2 submission remains incomplete.

Verification: All seven generated HTML pages were submitted to the W3C Nu validator on 2026-11-08 and returned zero errors and zero warnings. `checks/w3c/` retains the seven raw reports and `summary.json`, including the endpoint, check time and HTML SHA-256 hashes. The final local run passed all 19 automated tests, the seven-page structural check and the static build; report hashes matched the regenerated HTML. `npm run validate:w3c` submits HTML only; this result does not certify external CSS, responsive layout or the unfinished B/C screens. See `checks/README.md` for current automated-check results and limitations.

Publication: The user explicitly authorized the current commit/push to `origin/main`; actual publication is recorded in the GitHub commit history and must be verified against the remote. The 2026-11-07 entry below preserves the earlier state and limitations.

## 2026-11-07 — Shared starter and campaign-screen handoff

Tool: OpenAI Codex, with collaborating assistant agents.

Asked for: Finish Quang's foundation and campaign screen using the approved UI demo, leave the other tabs blank for the team, write matching project rules, and wait for Quang's review before pushing to GitHub.

Kept: The approved demo's horizontal navigation, account avatar, three-step workflow, campaign form and preview arrangement. Assistant work includes the static HTML/CSS/JavaScript starter, campaign model/store/view/controller, blank feature entry points, local tooling, automated checks and handoff documentation. Final acceptance by Quang is pending.

Changed: The demo is organized into shared layout/UI/styles and separately owned feature modules. Campaign draft and published snapshots are separated; browser storage and validation are explicit. Generated static pages preserve source markup for JavaScript-disabled viewing.

Rejected: Carrying completed application-review or scheduling-demo logic into the blank B/C areas; treating the layout name “Solid” as a SolidJS dependency; inventing live backend, account, email or applicant services; claiming unperformed screenshots, validation or human authorship.

By hand: The user supplied the approved direction, team ownership, student IDs, repository URL and review-before-push instruction. No manually authored code changes by team members are claimed in this entry. Quang's review and B/C implementation are pending and should be recorded when they happen.

Verification: On 2026-11-07 generation, 19/19 Node tests, seven-page structural checks and the static build passed. Separate code reviews found and corrected failed-storage navigation loss, misleading saved messages and missing static mobile navigation; regression coverage was added where appropriate. The browser check stopped because Computer Use could not verify the current Chrome URL. The automatic approval reviewer rejected uploading HTML to the W3C validator without destination approval; the user then chose to let the team run that check manually later. See `checks/README.md`. No browser screenshot or manual team-authored code is claimed. No commit or push occurred.
