# Verification

Rubric evidence: W3C results per page are `checks/validator-<page>.txt`; screenshots are in `screenshots/` (JavaScript off).

## 2026-11-09 — full prototype on `feature/c` (Nguyễn Thái Cường + Claude Code)

| Command | Observed result |
| --- | --- |
| `node scripts/generate.mjs` | Passed; 12 static HTML pages generated |
| `node --test` | Passed; 46 tests, 46 passed, zero failed |
| `node scripts/check.mjs` | Passed; 12 pages checked for local references, one h1, unique IDs, label targets and CSS structure |
| `node scripts/build.mjs` | Passed; static output in `dist/` |

Browser checks in the Claude desktop built-in browser against `npm run dev` (http://127.0.0.1:4173):

- Screen 3: seed draft shows HS-002/HS-005 as a real overlap; resolving HS-005 to 08:40 removed the conflict and the totals line read `4 = 3 + 0 + 1 + 0`. Save showed the saved state. The confirm dialog listed three real blockers (campaign not published, 3 pending reviews, 1 unassigned) and kept "Xác nhận lịch" disabled.
- Screen 2: page 2 showed "Hiển thị 6–8 trong 8 hồ sơ"; sort select and submission-time column present.
- Applicant flow: after publishing the sample campaign on screen 1 and signing in as Bùi Đăng Khoa, an empty submit listed 4 errors; a valid submit (PDF attached through the browser test tool) created HS-009 with merged availability 08:00–10:00 and an Executive notification; a second submit for the same position was refused with a link to the existing application. Applicant access to `schedule.html` showed the role notice.
- Interviewer and results pages were rendered with a temporarily injected `confirmedAt` in localStorage (rendering check only; removed afterwards, and all `clubflow.*` test keys were cleared).
- Horizontal overflow: 375px — `index`, `applications`, `schedule`, `results`, `discover`, `recruitment`, `events`, `profile`, `login` had `scrollWidth` 375 after fixes; 768px — `schedule` and `applications` within the viewport. Dark theme checked on screen 3.
- Fixed during this check: screen 3 table was cramped beside the config at 1280px (config now stacks above below 1440px); the sticky action bar could hide focused rows (now static); screen 2 overflowed at 375px because an `sr-only` header escaped `.table-scroll` (now `position: relative`); the shared footer touched the viewport edge below 1440px.

### Later checks the same day (after the UX passes and folder reorganisation)

| Command | Observed result |
| --- | --- |
| `node --test` | Passed; 50 tests, 50 passed, zero failed (adds `tests/public-pages.test.js`) |
| `node scripts/check.mjs` | Passed; 12 pages |
| `node scripts/build.mjs` | Passed (one transient Windows file-lock error on `index.html`, passed on immediate rerun) |

- Screenshots: nine full-page images in `screenshots/`, captured with device-width emulation; each page's `scrollWidth` equalled its viewport (360/768/1280). Method and a discarded first attempt are described in `screenshots/README.md`.
- JavaScript disabled (DevTools `setScriptExecutionDisabled`): `index.html`, `schedule.html` and `discover.html` render their full static content with the static header navigation. All 12 generated pages contain static main content. Time-relative text (countdowns, "current step", timeline progress labels) is omitted from the static snapshot so it cannot go stale.
- Keyboard: first Tab reaches the visible skip link; Enter on a schedule "Giải quyết" button opens the dialog with focus on its first select; Escape closes it and returns focus (with a visible outline) to the same button. Screen 1: publishing with an empty campaign name shows the error summary, sets `aria-invalid` and the linked `campaign-name-error` text and focuses the field; the Preview dialog returns focus to its trigger.
- Mobile fixes found by the screenshots: Screen 2/3 table names and IDs no longer stack word by word at 768px; on phones the schedule cards wrap IDs inside the card and the two availability time inputs stack so "08:00 AM" is not clipped.

### W3C Nu validation — 2026-11-09 (12 pages)

Cường explicitly authorized uploading the generated HTML to the public W3C Nu validator. `node scripts/generate.mjs` then `node scripts/validate-w3c.mjs` submitted all twelve pages (file content as text/html) to `https://validator.w3.org/nu/?out=json` at 2026-11-09T03:16:14Z, and again at 2026-11-09T03:27:34Z after the visible-label, tap-target and long-name changes; both runs returned zero errors and zero warnings. The SHA-256 of each submitted file is in [summary.json](w3c/summary.json) and matches the HTML in the repository. Per-page results in the rubric's naming are `checks/validator-<page>.txt` (for example [validator-index.txt](validator-index.txt)).

| HTML file | Errors | Warnings | Raw result |
| --- | ---: | ---: | --- |
| `index.html` | 0 | 0 | [campaign.json](w3c/campaign.json) |
| `applications.html` | 0 | 0 | [applications.json](w3c/applications.json) |
| `schedule.html` | 0 | 0 | [schedule.json](w3c/schedule.json) |
| `results.html` | 0 | 0 | [results.json](w3c/results.json) |
| `interviews.html` | 0 | 0 | [interviews.json](w3c/interviews.json) |
| `apply.html` | 0 | 0 | [apply.json](w3c/apply.json) |
| `my-applications.html` | 0 | 0 | [mine.json](w3c/mine.json) |
| `discover.html` | 0 | 0 | [discover.json](w3c/discover.json) |
| `recruitment.html` | 0 | 0 | [recruitment.json](w3c/recruitment.json) |
| `events.html` | 0 | 0 | [events.json](w3c/events.json) |
| `profile.html` | 0 | 0 | [profile.json](w3c/profile.json) |
| `login.html` | 0 | 0 | [login.json](w3c/login.json) |

Scope: this validates the generated static HTML (sample data, including the inline theme script). It does not validate HTML produced later by JavaScript, external CSS or responsive layout. If any page is regenerated after a source change, rerun the validator, because the hashes will no longer match.

Assessment submission after an interview's start time and results publication were verified by unit tests only, because the real date is before the interview day.

---

# Screen 1 verification

Last verified on 2026-11-08 with Node.js v24.19.0 and npm 11.17.0.

## Executed locally

| Command | Observed result |
| --- | --- |
| `npm.cmd run generate` | Passed; seven static HTML files generated |
| `npm.cmd test` | Passed; 19 tests, 19 passed, zero failed |
| `npm.cmd run check` | Passed; seven pages checked for local references, one h1, unique IDs, label targets and CSS structure |
| `npm.cmd run build` | Passed; static output generated in `dist/` |

The automated suite covers required campaign/position fields, valid date-times, positive integer quotas, duplicate positions, linked-position deletion guard, intake boundaries, persisted draft reload, separate published snapshots, corrupted/unavailable storage, one active campaign, failed-write working-copy baseline, safe previews, unsaved status, and local HTTP asset/access behavior.

The storage-write failure review found and fixed a navigation-loss edge: working edits must compare against `persistedSavedAt`, not a timestamp from an unsuccessful write. A regression test covers that distinction. Saved-message handling and form focus after Save/Publish were also corrected.

## W3C Nu validation — 2026-11-08

Quang explicitly authorized sending the prototype HTML to the public W3C Nu validator and publishing the verified handoff on 2026-11-08. The final check used `https://validator.w3.org/nu/?out=json` (validator version `26.11.5`); its exact timestamp is retained in [summary.json](w3c/summary.json).

| HTML file | Errors | Warnings | Raw result |
| --- | ---: | ---: | --- |
| `index.html` | 0 | 0 | [campaign.json](w3c/campaign.json) |
| `applications.html` | 0 | 0 | [applications.json](w3c/applications.json) |
| `schedule.html` | 0 | 0 | [schedule.json](w3c/schedule.json) |
| `discover.html` | 0 | 0 | [discover.json](w3c/discover.json) |
| `recruitment.html` | 0 | 0 | [recruitment.json](w3c/recruitment.json) |
| `events.html` | 0 | 0 | [events.json](w3c/events.json) |
| `profile.html` | 0 | 0 | [profile.json](w3c/profile.json) |

The first request found one shared error: the embedded favicon URL contained unescaped spaces. It was replaced in the shared layout with `assets/favicon.svg`; all pages were regenerated and revalidated. The files above are the successful final responses. [summary.json](w3c/summary.json) records the endpoint, timestamp and SHA-256 of each submitted HTML file.

This validates generated HTML, including inline SVG. It does not validate external CSS, responsive appearance or completed features. Screens 2/3 and the public pages remain intentionally blank scaffolds.

To rerun after source changes, regenerate the pages, then run `npm.cmd run validate:w3c`. This command uploads HTML to W3C and needs the team's authorization for that external destination.

## Not verified by these commands

- Actual browser interaction, image rendering and native form behavior.
- Computed layout or overflow at 360px, 768px and 1280px.
- Keyboard traversal and actual modal focus behavior in a browser.

Computer Use could not confidently establish the current Windows Chrome URL and stopped the browser check. No alternate browser-control path was used after that stop. No screenshots have been fabricated.

Quang reported on 2026-11-08 that the manual testing was complete and satisfactory and authorized the handoff push. This is user-reported review; no exact viewport measurements or screenshots were supplied to the assistant.

## Manual review for Quang

Run `npm.cmd run dev` and open `http://127.0.0.1:4173/`.

1. At 1280px, 768px and 360px, check the menu, large inputs and sticky three-step bar. Scroll to the bottom and verify there is no horizontal page overflow. At narrow widths use the Preview button to inspect the complete campaign.
2. Edit the campaign title, club, introduction, opening/closing date-times and instructions. Check that the sidebar preview follows all changes.
3. Add a position; enter its name, department, quota, description and requirements. Edit an existing department. Remove a position through the confirmation dialog.
4. Preview the full campaign, including each position's details. Close it with Escape and check focus returns to the triggering control.
5. Save a draft, refresh, and check all fields. Edit without saving, open the blank applications tab, then return to screen 1; check working edits are retained in the same browser tab.
6. Try publishing with blank text, an empty position list, non-positive/fractional quotas, and closing before opening. Check inline errors, preserved input, expanded invalid position and focus to the first invalid control.
7. Publish valid data. Change and save a new draft. Verify the form still says there are unpublished changes; the previously published snapshot remains intact until a new successful Publish.
8. Open every other tab and confirm only the shared shell plus a white content region is present. Do not count these blank scaffolds as completed B/C screens.
9. Check keyboard operation, visible labels/focus and light/dark contrast. Repeat with JavaScript disabled to check the generated static content.
10. Rerun W3C validation when the HTML changes, especially after B/C finish their pages. The current blank-page results do not replace validation of their finished screens.

Keep exact viewport observations and screenshot paths when the team records final submission evidence. The review above is sufficient for the user-approved development handoff, not a complete three-screen PA2 submission.
