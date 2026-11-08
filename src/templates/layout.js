import { icon, escapeHtml } from '../shared/ui.js';

const publicLinks = [
  ['discover', 'discover.html', 'Khám phá'],
  ['recruitment', 'recruitment.html', 'Đợt tuyển thành viên'],
  ['events', 'events.html', 'Sự kiện CLB']
];
const steps = [
  ['campaign', 'index.html', 'Chuẩn bị đợt tuyển', 'Thông tin & vị trí'],
  ['applications', 'applications.html', 'Tìm người đồng hành', 'Hồ sơ & vòng CV'],
  ['schedule', 'schedule.html', 'Sắp xếp cuộc gặp', 'Lịch & phỏng vấn']
];

/** Build-time page shell. Feature modules supply the page's single h1. */
export function renderLayout({ view, title, body }) {
  const management = steps.some(([key]) => key === view);
  const current = key => key === view ? ' class="active" aria-current="page"' : '';
  return `<!doctype html>
<html lang="vi" class="no-js" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#006bff">
  <meta name="description" content="ClubFlow — không gian tuyển thành viên câu lạc bộ.">
  <title>${escapeHtml(title)} · ClubFlow</title>
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="stylesheet" href="assets/fonts.css">
  <link rel="stylesheet" href="src/styles/tokens.css">
  <link rel="stylesheet" href="src/styles/base.css">
  <link rel="stylesheet" href="src/styles/shell.css">
  <link rel="stylesheet" href="src/styles/campaign.css">
  <script type="module" src="src/app.js"></script>
</head>
<body data-view="${escapeHtml(view)}">
  <a class="skip-link" href="#main">Đến nội dung chính</a>
  <header class="site-header" id="site-header">
    <div class="header-inner">
      <a class="brand" href="discover.html" aria-label="ClubFlow — Khám phá"><span class="brand-symbol">${icon('flow')}</span><span>ClubFlow<span class="brand-period">.</span></span></a>
      <nav class="site-navigation" id="site-navigation" aria-label="Điều hướng chính">
        ${publicLinks.map(([key, url, label]) => `<a href="${url}"${current(key)}>${label}</a>`).join('\n        ')}
      </nav>
      <div class="header-actions">
        <button class="icon-button theme-toggle" id="theme-toggle" data-action="theme" aria-label="Chuyển sang giao diện tối" aria-pressed="false"><span class="theme-moon">${icon('moon')}</span><span class="theme-sun">${icon('sun')}</span></button>
        <a class="button button-secondary header-cta" href="index.html">Không gian CLB${icon('arrow')}</a>
        <div class="account-wrap" id="account-wrap">
          <button class="account-trigger" id="account-trigger" data-action="account" aria-expanded="false" aria-controls="account-menu" aria-label="Tài khoản Vinh Quang"><img class="account-avatar" src="assets/discovery/avatar.png" alt="" width="40" height="40"><span class="account-label"><strong>Vinh Quang</strong><small>Ban tuyển dụng</small></span>${icon('down')}</button>
          <div class="account-menu" id="account-menu" hidden>
            <div class="account-menu-head"><img src="assets/discovery/avatar.png" alt="" width="44" height="44"><strong>Trần Vinh Quang</strong><p>Ban tuyển dụng</p></div>
            <a class="account-menu-item" href="profile.html">${icon('user')}Hồ sơ cá nhân</a>
            <a class="account-menu-item" href="index.html">${icon('grid')}Không gian quản lý CLB</a>
            <hr class="account-menu-divider">
            <button class="account-menu-item" data-action="theme">${icon('moon')}Đổi chế độ sáng / tối</button>
          </div>
        </div>
        <button class="icon-button mobile-menu" id="menu-toggle" aria-label="Mở menu" aria-controls="site-navigation" aria-expanded="false" data-action="menu">${icon('menu')}</button>
      </div>
    </div>
  </header>
  <div class="workspace-context" id="workspace-context"${management ? '' : ' hidden'}>
    <div class="workspace-meta"><nav class="workspace-breadcrumb" aria-label="Vị trí hiện tại"><a href="discover.html">Khám phá CLB</a>${icon('chevron')}<span>Không gian quản lý</span>${icon('chevron')}<span id="topbar-current">${escapeHtml(title)}</span></nav><span class="workspace-identity">CLB Truyền thông HCMUS</span></div>
  </div>
  <div class="workspace-workflow" id="workspace-workflow"${management ? '' : ' hidden'}>
    <nav class="workflow-tabs" aria-label="Ba bước tuyển thành viên">
      ${steps.map(([key, url, label, description], index) => `<a href="${url}"${current(key)}><span class="step-number">0${index + 1}</span><span><strong>${label}</strong><small>${description}</small></span>${icon('chevron')}</a>`).join('\n      ')}
    </nav>
  </div>
  <main id="main" tabindex="-1">${body}</main>
  <footer class="site-footer"><p>ClubFlow · Prototype tuyển thành viên CLB</p></footer>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <dialog id="app-dialog" aria-labelledby="dialog-title"><div id="dialog-content"><h2 id="dialog-title" class="sr-only">Hộp thoại</h2></div></dialog>
</body>
</html>
`;
}
