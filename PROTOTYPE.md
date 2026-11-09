# ClubFlow — PA2 responsive prototype

## 1. Team

| Member | Student ID | Responsibility |
| --- | --- | --- |
| Trần Vinh Quang (A) | 24127523 | Shared UI foundation, rules file and Screen 1 — Create Recruitment Campaign (`index.html`) |
| Lê Tấn Thành (B) | 24127540 | Screen 2 — Application Review (`applications.html`) |
| Nguyễn Thái Cường (C) | 24127336 | Screen 3 — Interview Scheduling (`schedule.html`); on 2026-11-09 also the role pages, public pages and cross-screen fixes (see `AI-LOG.md`) |

## 2. How to open it

- **Open `index.html`** straight from the folder. No network connection is needed: CSS, the Inter font files and the icons are all local, and no framework or CDN is loaded.
- With **JavaScript turned off** (how PA2 is marked) every page shows its full content as static HTML, and every link opens the next page through relative `<a href>` links.
- JavaScript adds interaction (saving drafts, filtering and sorting, editing the schedule, switching sample accounts). It is written as ES modules, which browsers do not run from `file://`. To try the interactive version, install Node.js 22 or newer and run `npm run dev` (no `npm install` needed), then open <http://127.0.0.1:4173/>. Data is kept in this browser's localStorage only.
- `npm run generate` rebuilds the 12 HTML pages from `src/`; `npm test`, `npm run check` and `npm run build` are the automated checks.

## 3. Screens

The main flow is the three pages below, in this order. Every page also has the shared header (logo → `discover.html`; nav → `discover.html`, `recruitment.html`, `events.html`; "Không gian CLB" → `index.html`) and the three-step bar (01 → `index.html`, 02 → `applications.html`, 03 → `schedule.html`).

| File | ClubFlow screen | What the user (club Executive) does there | Links on the page open |
| --- | --- | --- | --- |
| `index.html` | Create Recruitment Campaign | Edits campaign name, club, description, opening/closing date-time and instructions; adds, edits and removes departments/positions with quota, description and requirements; Save as Draft, Preview, Publish (validation with an error summary) | "Xem hồ sơ ứng tuyển" → `applications.html`; breadcrumb → `discover.html`, `index.html` |
| `applications.html` | Application Review | Sees application statistics; searches, filters by status and position, sorts and pages the list; opens an application beside the list (statement, CV preview, internal note); Shortlist or Reject; exports CSV | "Tiếp tục đến lịch phỏng vấn" → `schedule.html`; breadcrumb → `discover.html`, `index.html` |
| `schedule.html` | Interview Scheduling | Sets the interview date, time window, 15/20/30-minute duration, interviewers per position with availability, and rooms; generates a draft; reviews Proposed / Conflict / Unassigned rows with reasons; Edit / Resolve / Assign a slot; Save; export CSV; Approve & Confirm (blocked with listed reasons until intake closes, no reviews are pending, nothing is unassigned and no conflict remains) | "Về duyệt hồ sơ" → `applications.html`; after confirmation "Xem kết quả tuyển" → `results.html`; links in the conflict and unassigned notices jump to the table row |

Extra pages (not part of the scored main flow): `discover.html`, `recruitment.html`, `events.html` (public club page, open positions, recruitment timeline), `login.html` (sample accounts), `apply.html` and `my-applications.html` (applicant), `interviews.html` (interviewer), `results.html` (Executive results), `profile.html`.

One timeline is used on every page: applications open 08/11/2026 08:00 and close 20/11/2026 23:00, sample applications arrive 08–09/11, interviews are on 23/11/2026. Sample data includes a deliberately long name, "Công Tằng Tôn Nữ Phương Thảo Nguyên" (HS-009), shown on Screens 2 and 3.

## 4. Our design choices

- **One shell for the whole flow**: a horizontal header and a sticky three-step bar ("Chuẩn bị đợt tuyển → Tìm người đồng hành → Sắp xếp cuộc gặp") instead of separate layouts per screen, so the Executive always sees where they are in the flow.
- **Screen 1** keeps the large form on the left with a live preview on the right; below 1100px the preview stacks, and on phones the full preview opens from the "Xem trước" button.
- **Screen 2** shows the selected application in a side panel beside the list rather than an overlay drawer, so the list stays readable at every width (a "Fix these" problem in the brief); on phones the panel follows the list and has a back control.
- **Screen 3** puts the configuration above the timetable at every width: beside it, the seven-column table became too narrow to read. On phones the table turns into one card per interview. Statistics are counted from the same rows as the table, so the totals line always adds up.
- **Real confirmation rules**: "Approve & Confirm" is blocked until applications close (20/11/2026), so on the hand-in date it lists its blockers instead of confirming. We chose not to add a fake clock.
- **Accounts and roles**: there is no real sign-in. `login.html` switches between sample accounts (Executive, Applicant, Interviewer) to show what each role sees.
- Interviewers and applicants are different people in the sample data; no "verified" wording; the footer contains no template text.

## 5. Not wired yet

- **Sign-in, sign-out and accounts**: sample accounts only, no passwords or authentication; "Đăng xuất" only switches this browser to visitor mode.
- **Notifications** (bell in the header) exist only inside this browser; no email is sent.
- **CV files**: the application form checks a PDF's name, type and size but does not upload or store the file; "Xem CV" shows a sample preview.
- **Server and shared data**: no backend; every change is stored in this browser's localStorage, so another browser starts from the sample data.
- **With JavaScript off**: action buttons (Save, Publish, Preview, Shortlist/Reject, Generate draft, Approve & Confirm, CSV export, theme toggle, account menu) do nothing; all navigation still works through links.
- Interviewer assessments and result publication (`interviews.html`, `results.html`) are built but can only be reached after a schedule is confirmed, which the real dates block until after 20/11/2026.

## 6. CSS

- **Plain CSS**, no framework, no `!important` (checked by `npm run check`). Files in `src/styles/`: `tokens.css` (colours, radius, elevation, motion; light and dark theme), `base.css`, `shell.css`, `common.css`, then one stylesheet per feature (`campaign`, `applications`, `schedule`, `results`, `interviews`, `applicant`, `account`, `public`).
- **Colours**: brand blue `#006bff` and navy `#181c31` as tokens; body text and buttons meet 4.5:1 contrast.
- **Type**: Inter (self-hosted woff2), body and form text 16px.
- **Spacing scale**: 4, 8, 12, 16, 24, 32, 40, 48px. All CSS written for Screen 3, the role pages and the public pages uses only these values. The earlier shell, Screen 1 and Screen 2 CSS still contains some values outside the scale (for example 14px, 18px, 22px, 28px); normalising them is left for the team.
- **Breakpoints**: 767px (phone → tablet), 1099px (stacked → two-column layouts) and 1439px; the header also adapts at 1023px (menu button) and 1279px. They are written as `max-width` media queries.
- **Tap targets**: buttons and stand-alone links are at least 44px tall; tables scroll inside their own wrapper on small screens or become cards.

## Evidence and status

| Item | Where |
| --- | --- |
| Nine screenshots, JavaScript off, full page | `screenshots/index-*.png`, `screenshots/applications-*.png`, `screenshots/schedule-*.png` (method in `screenshots/README.md`) |
| W3C Nu results for every page (file upload, 0 errors) | `checks/validator-<page>.txt`, raw JSON and hashes in `checks/w3c/` |
| Automated checks, browser checks, keyboard and no-JS checks | `checks/README.md` |
| Rules file | `AGENTS.md` |
| Prompts given to the assistant / assistant log | `brief.md`, `AI-LOG.md` |

Open items: Quang and Thành still need to review the 2026-11-09 changes to the shared files and to Screens 1 and 2; `SELF_ASSESSMENT_REPORT.md` and the submission zip are the team's to complete.
