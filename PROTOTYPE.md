# ClubFlow prototype handoff

## Team and scope

| Member | Student ID | Responsibility |
| --- | --- | --- |
| Trần Vinh Quang (A) | 24127523 | Shared UI foundation and screen 1: create recruitment campaign |
| Lê Tấn Thành (B) | 24127540 | Screen 2: review applications |
| Nguyễn Thái Cường (C) | 24127336 | Screen 3: schedule interviews |

This handoff covers A's foundation and campaign screen. B/C content and the other navigation destinations are deliberately blank scaffolds for later team work. The full three-screen PA2 prototype and its submission evidence are not complete. On 2026-11-08, Quang reported that he had completed his manual checks and accepted the handoff, then explicitly authorized W3C validation and a commit/push of the completed work to `origin/main`. The earlier review gate is satisfied.

## Open the prototype

Use Node.js 22 or newer. From the repository directory run `npm run dev`, then open <http://127.0.0.1:4173/>. There are no package dependencies. The app is static HTML, custom CSS and vanilla JavaScript ES modules. `npm run build` generates a `dist/` static copy. Serve files through HTTP for JavaScript modules; direct `file://` viewing is not the supported interactive mode.

| Screen | Local path | Current scope |
| --- | --- | --- |
| 1 — Create recruitment campaign | [`index.html`](index.html) | Campaign information, opening/closing times, instructions, departments/positions, quotas, descriptions, requirements, Draft, Preview, Publish and link to screen 2 |
| 2 — Review applications | [`applications.html`](applications.html) | Blank content within the common layout; assigned to B |
| 3 — Schedule interviews | [`schedule.html`](schedule.html) | Blank content within the common layout; assigned to C |
| Other navigation | [`discover.html`](discover.html), [`recruitment.html`](recruitment.html), [`events.html`](events.html), [`profile.html`](profile.html) | Blank content within the common layout |

Static markup remains available with JavaScript disabled. Campaign interactions, storage, preview dialog, menus and theme changes require JavaScript. Paths are ordinary HTML links and use relative local assets. No runtime API or external data service is needed. Font rendering uses the configured Inter/system fallback; exact typography may depend on available fonts.

## PA2 layout and implementation

ClubFlow's three-screen workflow is campaign creation, application review and interview scheduling. The layout is implemented in this repository: horizontal navigation, an avatar account menu, a sticky three-step bar, a large campaign form on the left and a preview on the right. Open `index.html` through the local server to inspect screen 1. Shared markup is in `src/templates/layout.js`, screen 1 markup is in `src/features/campaign/view.js`, and styling is in `src/styles/`. These files define the UI; no separate demo checkout is needed.

The brand colors are blue `#006bff` and navy `#181c31`, with shared light/dark tokens and self-hosted Inter fonts. Content has a maximum width of 1440px. Use the spacing scale 4/8/12/16/24/32/40/48px for new shared components and the existing CSS rules for established elements. Main form boundaries are 767px, 1099px and 1439px; the header also adapts at 1023px and 1279px. Controls use visible focus, associated labels/errors, at least 16px input text and 44px interaction targets. Shared rules are in [`AGENTS.md`](AGENTS.md).

## Local behavior and boundaries

Draft and published campaigns are separate snapshots under localStorage key `clubflow.pa2.campaign.v1` (schema version 1). Draft accepts incomplete content; Publish validates the campaign and positions. Saving a draft preserves an existing published snapshot. Unsaved working edits use sessionStorage separately. Storage warnings distinguish an in-memory change from a persistent save.

The preview is a local representation of current campaign fields. Publishing does not send data to a server or make it public on the internet. Application review, applicant/CV data, shortlist/reject actions, interview configuration, assignment, conflict handling, exports and confirmations belong to later B/C work. Authentication, email delivery and a live backend are not wired. Availability slots are part of C's scheduling work.

## Verification and remaining submission work

On 2026-11-07, generation, all 19 automated tests, the seven-page structural check and the static build passed. Browser inspection then stopped because the current Chrome URL could not be verified, and a validator upload was blocked by automatic approval review; the user initially deferred W3C validation. Those limitations and that decision are historical. On 2026-11-08, Quang reported completing all his manual checks and explicitly requested W3C validation and a push. All seven generated HTML pages then passed the W3C Nu check with zero errors and zero warnings after the shared favicon's invalid data URI was replaced with `assets/favicon.svg`. Raw reports and a summary retaining the endpoint, check time and HTML SHA-256 hashes are under [`checks/w3c/`](checks/w3c/summary.json). This validates the submitted HTML, not external CSS or responsive appearance. See [`checks/README.md`](checks/README.md) for current command results and limitations. Quang's reported review does not supply recorded viewport dimensions or screenshots, and no such evidence is claimed here.

Before calling the full PA2 submission complete:

- [x] Quang accepts the handoff before the first commit/push (user-reported manual checks and explicit authorization on 2026-11-08).
- [x] Record actual test, structural-check and build results, with limitations.
- [ ] Check screen 1 in a browser at 360px, 768px and 1280px, including JavaScript-disabled rendering, keyboard focus, labels/errors, dialogs, navigation and horizontal overflow.
- [ ] B implements and verifies screen 2; C implements and verifies screen 3.
- [ ] Capture the required nine screenshots: all three screens at 360px, 768px and 1280px; save actual evidence paths.
- [x] Validate the seven current generated HTML pages with W3C Nu and retain the results (2026-11-08: zero errors and zero warnings).
- [ ] Repeat W3C validation for the final pages after B/C implementation and fix all errors; retain the results.
- [ ] Finish the English `PROTOTYPE.md`, `brief.md`, `AI-LOG.md` and `SELF_ASSESSMENT` with actual team work and evidence.
- [ ] Create the submission ZIP including `.git` and excluding `node_modules`; use the actual self-assessment score in the required report filename.
