# ClubFlow

Team starter for the ClubFlow recruitment prototype. This handoff implements Quang's shared foundation and screen 1, while leaving application review, interview scheduling and the other navigation content blank for their owners. It follows the approved `clubflow-ui-demo` layout using static HTML, custom CSS and vanilla JavaScript ES modules.

## Run locally

Install Node.js **22 or newer**, then run from this directory:

```sh
npm run dev
```

Open <http://127.0.0.1:4173/>. No dependency installation is required. Use the HTTP server for ES modules; do not open the HTML through `file://`.

On Windows PowerShell, use `npm.cmd run dev` if the `npm.ps1` alias is blocked by the execution policy. The same `npm.cmd` prefix works for the other commands below; no policy change is needed.

| Command | Purpose |
| --- | --- |
| `npm run generate` | Regenerate all seven root HTML pages from the shared template and campaign view |
| `npm test` | Run the Node test suite |
| `npm run check` | Check local references, one `h1`, unique IDs, labels and basic CSS structure |
| `npm run build` | Generate pages and create the static `dist/` output |

## Pages and ownership

| Page | Owner / state |
| --- | --- |
| [`index.html`](index.html) | A — Trần Vinh Quang (24127523): campaign form, positions, Draft, Preview and Publish |
| [`applications.html`](applications.html) | B — Lê Tấn Thành (24127540): shared shell with blank content |
| [`schedule.html`](schedule.html) | C — Nguyễn Thái Cường (24127336): shared shell with blank content |
| [`discover.html`](discover.html), [`recruitment.html`](recruitment.html), [`events.html`](events.html), [`profile.html`](profile.html) | Shared navigation destinations with blank content |

The root HTML contains static content for JavaScript-disabled viewing. JavaScript adds campaign editing, validation, browser storage and dialogs. Published campaigns are local browser snapshots; there is no backend or authentication.

## Continue the team work

Read [`AGENTS.md`](AGENTS.md) before editing. Change shared HTML in `src/templates/layout.js`, campaign HTML in `src/features/campaign/view.js`, then regenerate. Shared styles are under `src/styles/`; dialogs, toast and icons are in `src/shared/ui.js`.

Thành starts in `src/features/applications/index.js`; Cường starts in `src/features/schedule/index.js`. Each exports `mount(container, services)` and returns cleanup. Use `services.campaignStore.getPublished()` for campaign data and agree application/schedule contracts before connecting screens. B/C content is blank in this starter and ready for its owners to implement.

[`PROTOTYPE.md`](PROTOTYPE.md) records scope and outstanding submission evidence. [`AI-LOG.md`](AI-LOG.md) records assistant involvement; [`brief.md`](brief.md) preserves the requests. This starter is ready for B/C to continue; their screens and the full three-screen PA2 submission remain unfinished.

On 2026-11-08, Quang reported finishing his manual checks, accepted the handoff and explicitly requested W3C validation followed by a push of the completed work to `origin/main` at <https://github.com/TVinhQuang/ClubFlow>. The earlier review gate is satisfied. All seven generated HTML pages passed the W3C Nu check with zero errors and zero warnings; see [`checks/README.md`](checks/README.md) and the retained [`validator summary`](checks/w3c/summary.json) for results and limitations. This checks the submitted HTML; it does not certify external CSS or responsive behavior. The browser and network limitations recorded on 2026-11-07 are historical. This push is authorized; publication state is recorded in the GitHub commit history. Later repository publication still needs an explicit user request.
