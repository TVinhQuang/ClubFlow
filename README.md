# ClubFlow

ClubFlow is the team's PA2 recruitment prototype, built with static HTML, custom CSS and vanilla JavaScript ES modules. This repository implements Quang's shared foundation and screen 1, while leaving application review, interview scheduling and the other navigation content blank for their owners.

## UI structure included in this repository

Open [`index.html`](index.html) through the local server below to see the implemented layout. No separate demo folder is needed.

- The shared header contains the ClubFlow logo, navigation, light/dark switch and avatar account menu.
- Management pages have a sticky three-step bar: campaign creation, application review and interview scheduling.
- Screen 1 uses a large campaign form on the left and a live preview on the right. Below 1100px the content stacks; on phones the complete preview is available through the Preview button.
- Blue `#006bff`, navy `#181c31`, locally hosted Inter fonts and a 1440px maximum content width define the common appearance.

The actual UI sources are [`src/templates/layout.js`](src/templates/layout.js) for the shared shell, [`src/features/campaign/view.js`](src/features/campaign/view.js) for screen 1, and [`src/styles/`](src/styles/) for colors, spacing and responsive layouts. [`AGENTS.md`](AGENTS.md) specifies the rules for extending them.

## Folder structure

```text
ClubFlow/
├─ *.html                 12 generated pages; kept at the root so relative links work and index.html is the first page
├─ README.md AGENTS.md    project overview and team rules
├─ PROTOTYPE.md AI-LOG.md brief.md   PA2 submission documents
├─ package.json           Node scripts only, no dependencies
├─ assets/
│  ├─ favicon.svg
│  ├─ fonts/              Inter woff2 files, fonts.css, OFL licence
│  ├─ images/             avatar and other images
│  └─ licenses/           third-party licence of the original UI template
├─ src/
│  ├─ app.js              entry: services, role guard, header, theme
│  ├─ templates/layout.js shared page shell (header, workflow bar, footer)
│  ├─ shared/             ui (icons, dialog, toast, CSV), shell, accounts, session, notifications
│  ├─ features/           one folder per feature; each exports mount(container, services)
│  │  ├─ campaign/        Screen 1 · index.html            (Quang)
│  │  ├─ applications/    Screen 2 · applications.html     (Thành)
│  │  ├─ schedule/        Screen 3 · schedule.html         (Cường)
│  │  ├─ results/         results.html (Executive)
│  │  ├─ interviews/      interviews.html (Interviewer) + assessment store
│  │  ├─ applicant/       apply.html, my-applications.html
│  │  ├─ account/         login.html, profile.html
│  │  └─ public/          discover.html, recruitment.html, events.html
│  └─ styles/             tokens, base, shell, common + one stylesheet per feature
├─ scripts/               dev server, generate, check, build, W3C upload
├─ tests/                 node --test suites
├─ docs/                  implementation plan
├─ checks/                verification notes and W3C reports
└─ screenshots/           submission screenshots
```

Feature folders follow the same split where it applies: `seed.js` (sample data), `model.js` (pure rules), `store.js` (browser storage), `view.js` (HTML strings, also used by `scripts/generate.mjs`) and `index.js` (controller). Screen 1 keeps its original `controller.js` name.

## Run locally

Install Node.js **22 or newer**, then run from this directory:

```sh
npm run dev
```

Open <http://127.0.0.1:4173/>. No dependency installation is required. The static pages also open straight from the folder (`index.html`), with full content and working links even with JavaScript off; the interactive JavaScript (ES modules) needs this HTTP server because browsers do not run modules from `file://`.

On Windows PowerShell, use `npm.cmd run dev` if the `npm.ps1` alias is blocked by the execution policy. The same `npm.cmd` prefix works for the other commands below; no policy change is needed.

| Command | Purpose |
| --- | --- |
| `npm run generate` | Regenerate all twelve root HTML pages from the shared template and feature views |
| `npm test` | Run the Node test suite |
| `npm run check` | Check local references, one `h1`, unique IDs, labels and basic CSS structure |
| `npm run build` | Generate pages and create the static `dist/` output |

## Pages and ownership

| Page | Owner / state |
| --- | --- |
| [`index.html`](index.html) | A — Trần Vinh Quang (24127523): campaign form, positions, Draft, Preview and Publish |
| [`applications.html`](applications.html) | B — Lê Tấn Thành (24127540): application review with sorting, pagination and detail panel |
| [`schedule.html`](schedule.html) | C — Nguyễn Thái Cường (24127336): interview scheduling, conflicts and confirmation |
| [`results.html`](results.html) | Executive: assessments, Pass/Fail and in-app result notifications |
| [`login.html`](login.html), [`apply.html`](apply.html), [`my-applications.html`](my-applications.html), [`interviews.html`](interviews.html) | Sample-account sign-in, applicant and interviewer pages |
| [`discover.html`](discover.html), [`recruitment.html`](recruitment.html), [`events.html`](events.html), [`profile.html`](profile.html) | Public club, campaign and timeline pages; role-aware profile |

The default account is the Executive, so the three management screens open directly. Use **Đổi tài khoản** in the avatar menu (or `login.html`) to switch to an Applicant or Interviewer.

The root HTML contains static content for JavaScript-disabled viewing. JavaScript adds campaign editing, validation, browser storage and dialogs. Published campaigns are local browser snapshots; there is no backend or authentication.

## Continue the team work

Read [`AGENTS.md`](AGENTS.md) before editing. Change shared HTML in `src/templates/layout.js`, campaign HTML in `src/features/campaign/view.js`, then regenerate. Shared styles are under `src/styles/`; dialogs, toast and icons are in `src/shared/ui.js`.

Thành starts in `src/features/applications/index.js`; Cường starts in `src/features/schedule/index.js`. Each exports `mount(container, services)` and returns cleanup. Use `services.campaignStore.getPublished()` for campaign data and agree application/schedule contracts before connecting screens. B/C content is blank in this starter and ready for its owners to implement.

[`PROTOTYPE.md`](PROTOTYPE.md) records scope and outstanding submission evidence. [`AI-LOG.md`](AI-LOG.md) records assistant involvement; [`brief.md`](brief.md) preserves the requests. This starter is ready for B/C to continue; their screens and the full three-screen PA2 submission remain unfinished.

On 2026-11-08, Quang reported finishing his manual checks, accepted the handoff and explicitly requested W3C validation followed by a push of the completed work to `origin/main` at <https://github.com/TVinhQuang/ClubFlow>. The earlier review gate is satisfied. All seven generated HTML pages passed the W3C Nu check with zero errors and zero warnings; see [`checks/README.md`](checks/README.md) and the retained [`validator summary`](checks/w3c/summary.json) for results and limitations. This checks the submitted HTML; it does not certify external CSS or responsive behavior. The browser and network limitations recorded on 2026-11-07 are historical. This push is authorized; publication state is recorded in the GitHub commit history. Later repository publication still needs an explicit user request.

On 2026-11-09, after the team's screens and the role pages were added, Cường authorized a new W3C Nu run: all twelve generated pages returned zero errors and zero warnings (reports and hashes in [`checks/w3c/`](checks/w3c/summary.json)).
