# ClubFlow team rules

These rules apply to this PA2 repository, including work assisted by AI. Preserve the ClubFlow layout implemented here: horizontal site navigation, avatar account menu, sticky three-step recruitment workflow, a large campaign form on the left, and its preview on the right. The reference is `index.html`, generated from `src/templates/layout.js` and `src/features/campaign/view.js`, with the styles in `src/styles/`. No external demo folder is required; README.md describes the layout and how to open it.

## Ownership and current scope

| Owner | Scope | Entry points |
| --- | --- | --- |
| Trần Vinh Quang — 24127523 (A) | Shared foundation and screen 1: campaign creation | `index.html`, `src/templates/`, `src/shared/`, `src/styles/`, `src/features/campaign/`, tooling and team rules |
| Lê Tấn Thành — 24127540 (B) | Screen 2: application review | `applications.html`, `src/features/applications/` |
| Nguyễn Thái Cường — 24127336 (C) | Screen 3: interview scheduling | `schedule.html`, `src/features/schedule/` |

B and C currently have blank content areas inside the shared shell. Keep them blank until their owners implement them. Other navigation destinations are also blank scaffolds. Do not copy completed application or scheduling demos into this handoff or claim another member's work. Coordinate shared-file changes with Quang; keep feature-specific work inside its module.

## Stack and source of truth

- Use static HTML, custom CSS and vanilla JavaScript ES modules. Node.js **22 or newer** runs the dependency-free development, generation, build and test scripts. Do not introduce React, SolidJS, a CSS framework or a package dependency without a team decision.
- Use real relative `.html` links. All seven pages must open directly through an HTTP server; preserve useful static HTML when JavaScript is disabled. JavaScript progressively adds local form interactions, storage, dialogs and theme/menu controls.
- Edit `src/templates/layout.js` for shared markup and `src/features/campaign/view.js` for screen 1 markup. Run `npm run generate` to update the generated root HTML files. Do not maintain separate hand-edited copies of generated markup.
- Use `src/shared/ui.js` for icons, escaping, toast and dialog behavior. Each feature exports `mount(container, services)` and returns a cleanup function. `src/app.js` mounts the page selected by `body[data-view]`; navigation loads another HTML page.
- Keep CSS in `src/styles/tokens.css`, `base.css`, `shell.css` and `campaign.css`. New B/C styles should use their own feature namespace and stylesheet, with shared tokens rather than copied shell rules.

## Visual and accessibility contract

- Brand blue is `#006bff`; navy is `#181c31`. Use the shared color tokens, including dark-theme tokens, rather than arbitrary new colors. Use Inter with the supplied system-font fallback.
- Main content has a maximum width of **1440px**. Use spacing values **4, 8, 12, 16, 24, 32, 40, 48px**. Reuse the card, control and navigation rules in `src/styles/base.css`, `shell.css` and `campaign.css`; shared colors and dimensions are defined in `tokens.css` in the same directory.
- Main form boundaries are **767px**, **1099px** and **1439px**; the shared header also adapts at **1023px** and **1279px**. At small widths stack content, preserve source order, and keep actions reachable. The duplicate sidebar preview may hide because the full Preview action remains available. Do not hide required form content to make a screenshot fit.
- Interactive targets should be at least **44 × 44px**; form text is at least **16px**. Keep visible keyboard focus. Associate labels and errors with controls, expose status changes accessibly, and restore focus after dialogs.
- Each page has one `h1`. Prefer semantic HTML and real buttons/links; do not create click-only `div` controls. Escape user-supplied strings before HTML interpolation. No `!important`.
- Product UI stays in Vietnamese. Keep prototype/development explanations in the shared footer or documentation, rather than placing implementation details inside the user's task flow.

## Shared data contract

```js
Campaign = {
  id, name, club, description, instructions,
  open, close, // local date-time strings: YYYY-MM-DDTHH:mm
  positions: [{ id, department, name, quota, description, requirements }]
}
```

`quota` is a positive integer for publishing; draft fields may be incomplete. Campaign and position IDs stay stable across edits. Never use a row index or a label as a persisted ID.

Create the shared store with `createCampaignStore(storage, options)` from `src/features/campaign/store.js`. Its interface is `getDraft()`, `getPublished()`, `saveDraft(campaign)`, `publish(campaign)` and `getMeta()`. Options include `now` and `getApplications`. The app passes `services.campaignStore` and `services.ui` to feature modules. B/C read published data through the store, not another feature's DOM, and must agree their application-data interface before wiring it.

- Storage envelope version: `schemaVersion: 1`; localStorage key: `clubflow.pa2.campaign.v1`.
- Draft and published campaign are separate snapshots. Saving a draft must not unpublish or silently replace the published snapshot. Publish validates complete fields, valid dates, closing after opening, and at least one valid position.
- `getMeta()` reports timestamps, storage warnings, persistence and publication state. `persistedSavedAt` is the timestamp of the last successful durable write, distinct from an in-memory `savedAt`; keep session working copies compatible with that durable baseline after write failures. Show storage failures honestly; do not report durable saving when persistence failed.
- The campaign controller uses sessionStorage key `clubflow.pa2.campaign.working.v1` to retain unsaved working edits during navigation. It is distinct from an explicit saved draft.
- Do not remove a position with linked applications. Do not implement scheduling availability or applicant records inside campaign code. B/C own those sample datasets and behavior.
- This prototype has no backend, authentication, email delivery or real applicant records. Do not invent server success, account security, confirmation emails or other live-service behavior.

## Workflow and evidence

1. Read this file and the relevant module before editing. Suggested branches are `feature/a-campaign`, `feature/b-applications`, and `feature/c-schedule`; these names do not imply branches already exist.
2. Keep changes scoped to your ownership. Agree changes to shared contracts before implementing a dependency between screens.
3. After changing markup, run `npm run generate`. Before handoff, run `npm test`, `npm run check` and `npm run build`; record the actual results and limitations.
4. Check desktop, tablet and mobile layouts, keyboard navigation, labels/errors, storage failure, draft/publish separation and page-to-page navigation. A local structural check is not W3C validation or a browser screenshot.
5. Update the English `PROTOTYPE.md`, `AI-LOG.md` and `brief.md` honestly. Never mark unperformed checks, screenshots or another member's implementation as complete.

**Current review gate:** On 2026-11-08, Quang reported completing his manual checks, accepted this handoff and explicitly requested W3C validation and a push of the completed work to <https://github.com/TVinhQuang/ClubFlow>. That request authorizes the current validation, commit and push to `origin/main`; the earlier review-before-push gate is satisfied. Coordinate review of later changes with their owners; later commits, pushes, merges or publication require an explicit user request.
