# ClubFlow PA2 — A's handoff plan

## Agreed scope

- Trần Vinh Quang (24127523): shared foundation and campaign-creation screen.
- Lê Tấn Thành (24127540): application-review screen; this starter supplies a module and blank content area for him to develop.
- Nguyễn Thái Cường (24127336): interview-scheduling screen; this starter supplies a module and blank content area for him to develop.
- Preserve the team's approved "Solid" layout: horizontal navigation, avatar account menu, sticky three-step workflow, large form on the left and preview on the right. "Solid" is the layout description, not a framework choice.
- Keep links and blank scaffolds for the other tabs. Do not include the screen 2–3 demo logic in this handoff.
- The original review-before-push gate is satisfied: on 2026-11-08 Quang reported completing his manual checks and explicitly authorized W3C validation and a commit/push of the completed work to `origin/main` at <https://github.com/TVinhQuang/ClubFlow>. Later changes require coordinated review, and repository publication requires an explicit user request.

## Stack

Static HTML, custom CSS and vanilla JavaScript ES modules; Node.js 22 or newer runs the server, build and tests. There are no application dependencies. `PA2/Requirement.txt` permits this stack. The project is in the separate `ClubFlow/` clone; the demo is the layout reference.

## Implementation units

1. [x] Shared shell, tokens and components: `index.html`, `src/app.js`, `src/shared/`, `src/styles/`.
2. [x] Screen 1: `src/features/campaign/` contains the model, store, view and controller. Draft and published campaigns are separate snapshots; working edits survive tab navigation, and localStorage preserves saved data across reloads.
3. [x] Tab scaffolds: `src/features/applications/`, `src/features/schedule/` and `src/features/public/` export mount functions for blank content areas, without completed feature data or logic.
4. [x] `package.json`, local server, static build, model/storage tests and local HTTP checks.
5. [x] Rules and handoff: `AGENTS.md`, `README.md`, `PROTOTYPE.md`, `AI-LOG.md` and evidence/checklists distinguish completed work from the team's remaining tasks.
6. [x] Quang's review and explicit authorization, reported by the user on 2026-11-08.
7. [x] W3C Nu validation of the seven current generated HTML pages on 2026-11-08: zero errors and zero warnings. Raw reports and a summary with check time, endpoint and HTML SHA-256 hashes are retained in `checks/w3c/`.
8. [x] Prepare the completed handoff for the explicitly authorized commit/push to `origin/main`; actual publication is recorded in the GitHub commit history and verified against the remote.

Status: A's starter is accepted and ready for B/C to continue. On 2026-11-08, all 19 automated tests, the seven-page structural check and the static build passed. All seven current HTML pages passed W3C Nu after the invalid shared favicon data URI was replaced with `assets/favicon.svg`. The validator checks submitted HTML, not external CSS or responsive appearance. The browser and upload limitations and the initial W3C deferral recorded on 2026-11-07 are historical. See `checks/README.md` for current results and limitations. No screenshots or specific viewport dimensions are inferred from Quang's reported manual review. The current commit/push is explicitly authorized; actual publication is recorded in the GitHub commit history.

## Team integration contract

- `index.html`, `applications.html` and `schedule.html` are the three PA2 screens. HTML includes static content when JavaScript is disabled and is generated from templates with `npm run generate`.
- Campaigns and positions have stable IDs. B/C use the store API to read the published campaign, rather than reading screen 1's DOM.
- Each module exports `mount(container, services)` and returns cleanup. The app selects the module through `body.dataset.view`. Navigation uses relative HTML links, without a hash router.
- Feature CSS has its own namespace and uses shared color and size tokens.

## Verification contract and remaining evidence

- Publish requires nonempty trimmed strings, valid dates with closing after opening, at least one position, positive integer quotas, and complete department/name/description/requirements fields.
- Draft accepts incomplete content; Preview safely represents missing values.
- Check save/reload, corrupt or unavailable storage, and preservation of the published snapshot when saving a draft.
- Check adding/editing/removing positions, navigation away and back, preview updates for all fields and accurate publication status.
- Retain actual desktop/tablet/mobile observations, focus/label/error/dialog checks and overflow evidence when recorded. Quang's 2026-11-08 report satisfies the review gate but supplies no screenshot files or viewport measurements.
- B/C must implement and verify their screens. Repeat W3C checks after their changes for the final three-screen submission.
- Record actual evidence only; do not mark unperformed screenshots or tests complete.
