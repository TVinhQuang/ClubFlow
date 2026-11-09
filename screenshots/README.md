# Screenshot evidence

Full-page screenshots of the three main-flow pages at 360px, 768px and 1280px, **with JavaScript turned off** (as PA2 static pages are marked), captured on 2026-11-09 by Nguyễn Thái Cường with Claude Code.

| Page | 360px | 768px | 1280px |
| --- | --- | --- | --- |
| `index.html` — Create Recruitment Campaign | [index-360.png](index-360.png) | [index-768.png](index-768.png) | [index-1280.png](index-1280.png) |
| `applications.html` — Application Review | [applications-360.png](applications-360.png) | [applications-768.png](applications-768.png) | [applications-1280.png](applications-1280.png) |
| `schedule.html` — Interview Scheduling | [schedule-360.png](schedule-360.png) | [schedule-768.png](schedule-768.png) | [schedule-1280.png](schedule-1280.png) |

## How they were captured

- Google Chrome headless driven through the DevTools Protocol: `Emulation.setScriptExecutionDisabled` (JavaScript off), `Emulation.setDeviceMetricsOverride` for the width (device scale factor 1), then `Page.captureScreenshot` over the measured page height. This matches DevTools' device toolbar + "Capture full size screenshot".
- Pages served by `npm run dev`; with JavaScript off they are the same static HTML that opens from the folder, so the content is the sample data written into the pages.
- Every capture measured `scrollWidth` equal to the viewport width: no horizontal scroll at any width.
- A first attempt with Chrome's `--window-size=360` was discarded: headless Chrome enforces a minimum window width of about 500px, which cropped a wider layout. Earlier JavaScript-on images named `campaign-*.png` were replaced by these files.
