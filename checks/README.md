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
