import { icon, escapeHtml } from '../shared/ui.js';
import { accounts } from '../shared/accounts.js';
import { renderAccountTrigger, renderAccountMenu, ctaFor } from '../shared/shell.js';

const publicLinks = [
  ['discover', 'discover.html', 'Khám phá'],
  ['recruitment', 'recruitment.html', 'Đợt tuyển thành viên'],
  ['events', 'events.html', 'Lịch trình tuyển']
];
const steps = [
  ['campaign', 'index.html', 'Chuẩn bị đợt tuyển', 'Thông tin & vị trí'],
  ['applications', 'applications.html', 'Tìm người đồng hành', 'Hồ sơ & vòng CV'],
  ['schedule', 'schedule.html', 'Sắp xếp cuộc gặp', 'Lịch & phỏng vấn']
];
/** Shared foundation first, then shared page utilities, then one stylesheet per feature. */
const stylesheets = ['tokens', 'base', 'shell', 'common', 'campaign', 'applications', 'schedule', 'results', 'interviews', 'applicant', 'account', 'public'];

/** Build-time page shell. Feature modules supply the page's single h1. The static header shows the default Executive account. */
export function renderLayout({ view, title, body, roles = [], area = '' }) {
  const management = steps.some(([key]) => key === view);
  const workspace = management || area === 'management';
  const current = key => key === view ? ' class="active" aria-current="page"' : '';
  const user = accounts[0];
  const [ctaHref, ctaLabel] = ctaFor(user);
  return `<!doctype html>
<html lang="vi" class="no-js" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#006bff">
  <meta name="description" content="ClubFlow — không gian tuyển thành viên câu lạc bộ.">
  <title>${escapeHtml(title)} · ClubFlow</title>
  <script>try{var d=document.documentElement;if(localStorage.getItem('clubflow.theme')==='dark'){d.dataset.theme='dark';}if(!sessionStorage.getItem('clubflow.entered')){d.classList.add('page-enter');sessionStorage.setItem('clubflow.entered','1');}}catch(e){}</script>
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="stylesheet" href="assets/fonts/fonts.css">
  ${stylesheets.map(name => `<link rel="stylesheet" href="src/styles/${name}.css">`).join('\n  ')}
  <script type="module" src="src/app.js"></script>
</head>
<body data-view="${escapeHtml(view)}" data-roles="${escapeHtml(roles.join(' '))}">
  <a class="skip-link" href="#main">Đến nội dung chính</a>
  <header class="site-header" id="site-header">
    <div class="header-inner">
      <a class="brand" href="discover.html" aria-label="ClubFlow — Khám phá"><span class="brand-symbol">${icon('flow')}</span><span>ClubFlow<span class="brand-period">.</span></span></a>
      <nav class="site-navigation" id="site-navigation" aria-label="Điều hướng chính">
        ${publicLinks.map(([key, url, label]) => `<a href="${url}"${current(key)}>${label}</a>`).join('\n        ')}
      </nav>
      <div class="header-actions">
        <button class="icon-button theme-toggle" id="theme-toggle" data-action="theme" aria-label="Chuyển sang giao diện tối" title="Giao diện tối" aria-pressed="false"><span class="theme-moon">${icon('moon')}</span><span class="theme-sun">${icon('sun')}</span></button>
        <div class="notify-wrap" id="notify-wrap">
          <button class="icon-button notify-trigger" id="notify-trigger" data-action="notifications" aria-expanded="false" aria-controls="notify-panel" aria-label="Thông báo" title="Thông báo">${icon('bell')}<span class="notify-count" id="notify-count" hidden></span></button>
          <div class="account-menu notify-panel" id="notify-panel" hidden></div>
        </div>
        <a class="button button-secondary header-cta" id="header-cta" href="${ctaHref}">${ctaLabel}${icon('arrow')}</a>
        <div class="account-wrap" id="account-wrap">
          <button class="account-trigger" id="account-trigger" data-action="account" aria-expanded="false" aria-controls="account-menu" aria-label="Tài khoản ${escapeHtml(user.name)}">${renderAccountTrigger(user)}</button>
          <div class="account-menu" id="account-menu" hidden>
            ${renderAccountMenu(user)}
          </div>
        </div>
        <button class="icon-button mobile-menu" id="menu-toggle" aria-label="Mở menu" title="Menu" aria-controls="site-navigation" aria-expanded="false" data-action="menu">${icon('menu')}</button>
      </div>
    </div>
  </header>
  <div class="workspace-context" id="workspace-context"${workspace ? '' : ' hidden'}>
    <div class="workspace-meta"><nav class="workspace-breadcrumb" aria-label="Vị trí hiện tại"><a href="discover.html">Khám phá CLB</a>${icon('chevron')}<a href="index.html">Không gian quản lý</a>${icon('chevron')}<span id="topbar-current">${escapeHtml(title)}</span></nav><span class="workspace-identity">CLB Truyền thông HCMUS</span></div>
  </div>
  <div class="workspace-workflow" id="workspace-workflow"${management ? '' : ' hidden'}>
    <nav class="workflow-tabs" aria-label="Ba bước tuyển thành viên">
      ${steps.map(([key, url, label, description], index) => `<a href="${url}"${current(key)}><span class="step-number">0${index + 1}</span><span><strong>${label}</strong><small>${description}</small></span>${icon('chevron')}</a>`).join('\n      ')}
    </nav>
  </div>
  <main id="main" tabindex="-1">${body}</main>
  <footer class="site-footer"><p>ClubFlow · Prototype tuyển thành viên CLB · Dữ liệu minh họa lưu trên trình duyệt này; không có máy chủ, mật khẩu hay email thật.</p></footer>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <dialog id="app-dialog" aria-labelledby="dialog-title"><div id="dialog-content"><h2 id="dialog-title" class="sr-only">Hộp thoại</h2></div></dialog>
</body>
</html>
`;
}
