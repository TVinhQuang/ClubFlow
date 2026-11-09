# AI assistance log

This log records assistant involvement in the current ClubFlow handoff. It does not attribute assistant-generated code to a human team member. The team owns the submitted result and must be able to explain it. Earlier prompts, manual edits or checks are not reconstructed without evidence.

## 2026-11-09 — Fixes from a rubric self-check (Nguyễn Thái Cường)

Tool: Claude Code. Asked for: read `PA2-rubric-responsive-prototype.md`, grade the project as a teacher would, then fix items 1–6.

Caught by checks: a CDP script that opens the pages from the folder with JavaScript off at 360/768/1280 (same measurements the rubric lists) found that Screen 2's search, sort and position controls had only screen-reader labels (rubric: visible label), and that its row buttons were 36px and 42px tall at 360px (rubric: 44px). The rubric also asks for a long item; none existed. The first JS-off screenshot then showed the new long name cut off inside the Screen 2 table.

Changed: visible labels "Tìm hồ sơ", "Sắp xếp", "Vị trí"; 44px row buttons; sample application HS-009 "Công Tằng Tôn Nữ Phương Thảo Nguyên" (shortlisted, with a proposed 10:00 slot so it appears on Screens 2 and 3) and the next-ID test updated to HS-010; names wrap on phones with a minimum column width; `PROTOTYPE.md` rewritten in the six sections the rubric requires (it previously said not to open pages from `file://`, which is how marking works with JavaScript off); README run note corrected; nine screenshots recaptured with JavaScript off and renamed `index-*`, `applications-*`, `schedule-*`; W3C rerun (12 pages, 0 errors, 0 warnings) and `checks/validator-<page>.txt` written from the reports.

Rejected: rewriting `brief.md` to add constraints after the fact (it must stay what was actually given); enlarging the three 17px links inside the Screen 3 notice sentences, which the rubric exempts as in-sentence links.

Verification: 50/50 tests, 12-page check, build; JS-off audit of all 12 pages with no horizontal scroll, overflow, heading skips, unlabeled inputs, missing alt or broken links; measured the long name wrapping to two lines inside the table wrapper at 360px.

## 2026-11-09 — W3C Nu validation of the 12 pages (Nguyễn Thái Cường)

Cường wrote "Đồng ý chạy W3C". `node scripts/generate.mjs` and `node scripts/validate-w3c.mjs` uploaded the twelve generated pages to `https://validator.w3.org/nu/?out=json` (2026-11-09T03:16:14Z): every page returned zero errors and zero warnings, so no HTML changes were needed. Raw reports, the summary and file hashes are in `checks/w3c/`; `checks/README.md`, `PROTOTYPE.md` and `README.md` record the result. Scope: static generated HTML only.

## 2026-11-09 — Remaining plan items: screenshots, Screen 1 checks, no-JS and keyboard (Nguyễn Thái Cường)

Captured the nine required screenshots with headless Chrome through the DevTools Protocol (device-width emulation). A first attempt with `--window-size=360` was discarded because headless Chrome enforces a ~500px minimum width and produced cropped wide layouts. The screenshots exposed, and this pass fixed, stacked names/IDs in Screen 2/3 tables at 768px, IDs overflowing schedule cards on phones and clipped time inputs on phones. Checked Screen 1 errors/labels/dialog focus, keyboard skip link and dialog focus return, and JavaScript-disabled rendering; static HTML no longer contains time-relative text (countdowns, current step) that would go stale. Updated `screenshots/README.md`, `checks/README.md` and the `PROTOTYPE.md` checklist. Still open: W3C rerun (needs authorization to upload), Quang/Thành review, `SELF_ASSESSMENT` and the submission ZIP (team decisions).

## 2026-11-09 — Screen 3 config panel fixes and pointer/scroll presence (Nguyễn Thái Cường)

From Cường's screenshot of the interviewer settings: the fieldset legend straddled the card border, position choices took one row each, time inputs clipped "08:00 AM", and the panel had its own scroll inside the page scroll (ui-ux-pro-max: avoid nested scroll regions). Fixed in `schedule.css`: legend floated inside the card, positions two per row, narrower input padding, no sticky/inner scroll, and the configuration now always sits above the timetable because beside it the 7-column table wrapped names onto three lines (date/time/duration on one row, three interviewer cards side by side). Pointer and scroll presence (`common.css`, `app.js`): content cards get a border tint on hover only (no lift or pointer cursor, so they don't look clickable); below-the-fold blocks on reading pages (discover, recruitment, timeline, profile, login, my applications, interviews) rise in once via IntersectionObserver (360ms, 40ms stagger), never on management screens that re-render; a soft light follows a fine pointer inside the Discover hero. All skip touch-only input and reduced motion; print always shows content. Verification: 50/50 tests, 12-page check, build; browser measurements at 1500px (no inner scroll, legend inside card, input not clipped, names on one line), reveal completed after real scrolling, hero light tracked the pointer, 375px without horizontal overflow.

## 2026-11-09 — Discover, Recruitment and Timeline UX pass with the ui-ux-pro-max skill (Nguyễn Thái Cường)

Skill guidance used: landing pattern "Hero + features + CTA" (primary action in the hero and repeated at the end), helpful empty states with an action, progressive disclosure for secondary content. Changes in `src/features/public/` and `src/styles/public.css`: one primary hero action per role (visitor → open positions, applicant → apply, executive → manage, interviewer → schedule; timeline when nothing is published); a deadline countdown and intake progress bar computed from the campaign dates; an "open positions" grid whose cards deep-link to `recruitment.html#role-<id>`; the journey highlights the current step from the same milestones as the timeline; a five-question FAQ written from the brief's rules (no invented statistics); a closing CTA band. Recruitment: jump links, deep-linked card highlight and focus after render, countdown in the ribbon, "Ứng tuyển vị trí này" per card that preselects the position on `apply.html?position=<id>`. Timeline: "current phase / next milestone" cards with days remaining, filled connector for finished milestones and a role-specific action on the current step. Added `tests/public-pages.test.js` (50/50 tests pass). Browser checks: unpublished and published states, applicant CTA and deep link + prefill, timeline wording, 375px overflow on discover/recruitment/events, dark theme on discover. Test data in the browser was cleared afterwards.

## 2026-11-09 — Pointer interaction pass with the ui-ux-pro-max skill (Nguyễn Thái Cường)

Skill guidance used (ux domain): visible hover change and pointer cursor on every clickable element, a distinct pressed state, no hover/press on disabled controls, never rely on hover alone, smooth scrolling for anchors, shared motion tokens, reduced-motion respected. Fixed: link buttons (`<a class="button-quiet">`, `button-danger`) had no hover because rules used `:hover:enabled`; now `:not(:disabled)` for buttons and links, with pressed states for every variant and icon buttons. Forward arrows nudge on hover and workflow-step chevrons slide (pointer devices only). Nav links show a growing underline. The Screen 1 position accordion, Screen 2 search/filter inputs and table rows got hover/press feedback; clicking anywhere on a Screen 2 row opens that applicant (buttons remain the keyboard path). Dialogs close when the press starts and ends on the backdrop, except dialogs containing a form (no lost input). Icon-only buttons have tooltips. Hard-coded 120/150/160ms timings replaced by tokens. Verification: 46/46 tests, 12-page check, build; browser checks for row click, backdrop close (with and without form), link-button hover colour, and 375px overflow on index/applications/schedule.

## 2026-11-09 — Folder reorganisation (Nguyễn Thái Cường)

Asked for: review the boilerplate layout and arrange the project folders sensibly. Kept at the root: the 12 generated pages (dev server, relative links, `index.html` as first page) and the submission documents. Moved: `src/features/portal/` → `applicant/`; login/profile split from `public/` into `account/`; `assessments/store.js` → `interviews/store.js`; `src/styles/pages.css` split into `common.css`, `public.css`, `account.css`, `applicant.css`, `interviews.css`, `results.css`; `assets/discovery/avatar.png` → `assets/images/`; `assets/solid/LICENSE.txt` → `assets/licenses/solid-template-LICENSE.txt`; `assets/fonts.css` → `assets/fonts/`; `tests/roles-and-portal.test.js` → `roles-pages.test.js`. Not renamed: Quang's and Thành's files (e.g. `campaign/controller.js`) to avoid merge conflicts. Updated README (folder map), AGENTS (stylesheet list), `docs/IMPLEMENTATION_PLAN.md` status note and the W3C summary scope text. Verification: 46/46 tests, 12-page check and build passed; browser check of fonts, avatar, profile/login/results with no console errors.

## 2026-11-09 — Dark-mode flash and "page reset" fix (Nguyễn Thái Cường)

Reported: every click felt like the page reset, and in dark mode the screen flashed light. Causes: generated HTML always started with `data-theme="light"` and `app.js` applied the saved theme only after loading, so each page navigation painted light first while button colours transitioned; the new entrance animation replayed whenever a screen re-rendered (Save, Apply, Publish). The notification bell also appeared only after JS, shifting the header. Fix: a small inline script in `<head>` (before stylesheets) applies the saved theme and marks only the first page of a browser session for the entrance animation; `app.js` removes that class after 600ms; the bell is present in static HTML. Verified in the browser: dark theme set before CSS/app.js, no entrance animation on later pages or after Save; 46/46 tests and the 12-page check passed.

## 2026-11-09 — Visual style pass with the ui-ux-pro-max skill (Nguyễn Thái Cường)

Tool: Claude Code with the ui-ux-pro-max skill. Its design-system search recommended a flat SaaS style for a three-step funnel with subtle 150–200ms motion. Its suggested palette and font were **not** adopted because AGENTS.md fixes brand blue/navy and Inter.

Changed: `tokens.css` (tinted page ground, hairline-bordered white cards, elevation/radius/motion tokens, dark-theme counterparts, slightly darker muted text), `base.css` (button press feedback, dialog/menu entrance, one staggered page entrance, global reduced-motion rule, notices on card surface), `shell.css` (header divider, active nav underline, workflow band on ground with highlighted current step), stronger input borders and focus border, shaded table headers, hover/press states for clickable cards. Verification: 46/46 tests, 12-page check and build passed; 375px overflow checks on applications, schedule, index and login; dark theme checked on discover.

## 2026-11-09 — Screen 3, role pages and cross-screen completion (Nguyễn Thái Cường)

Tool: Claude Code (Claude Opus 5.5) in the Claude desktop app, branch `feature/c`.

Asked for: Read the boilerplate and `ClubFlow-final-project-brief.md`, implement Screen 3, then — at Cường's explicit request — complete the whole prototype, including missing role screens and fixes to Screens 1/2, using the ui-ux-pro-max skill for the UI pass.

Changed (assistant-written, owned by Cường for review):
- Screen 3 (`src/features/schedule/`, `src/styles/schedule.css`): one interview date, 15/20/30-minute slots, interviewers assigned to positions with availability, rooms from a fixed list, sequential first-fit draft, real applicant/interviewer/room conflicts, unassigned reasons, Edit/Resolve/Assign dialog with live checks, Save, CSV export, Approve & Confirm with blockers (deadline, pending reviews, unassigned, conflicts) and read-only after confirmation.
- New pages: `login.html` (sample accounts, no passwords), `apply.html`, `my-applications.html`, `interviews.html`, `results.html`; filled `discover.html`, `recruitment.html`, `events.html` (recruitment timeline), `profile.html`. New shared modules `src/shared/{accounts,session,notifications,shell}.js`, stores for assessments and results, `src/styles/pages.css`.
- Shared files (Quang's area): `src/app.js` (services, role guard, role-aware header, in-app notifications), `src/templates/layout.js`, `scripts/generate.mjs` (12 pages), `scripts/check.mjs`, `src/shared/ui.js` (icons, `downloadCsv`), `shell.css` footer width. Screen 1 controller becomes read-only after schedule confirmation.
- Screen 2 (Thành's area): sorting, real pagination, submission-time column, live intake status, shared stores, read-only after confirmation, CV preview without inline styles or hard-coded colours, sample submission times moved to 08–09/11/2026, `create()`/`findDuplicate()` in the store.

Kept: shell layout, tokens, Screen 1 behaviour, Screen 2 structure. Rejected: inventing passwords, email or server success; a demo clock that would bypass the brief's confirmation rules; storing applicant notes where applicants or interviewers can read them.

By hand: Cường chose live shortlisted data, real (not simulated) confirmation blocking, and the full-project scope. Quang and Thành have **not** yet reviewed the changes to their areas.

Verification: see `checks/README.md` (2026-11-09). 46/46 tests, 12-page structural check and build passed; browser checks at 375/768/1280px; W3C not rerun.

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
