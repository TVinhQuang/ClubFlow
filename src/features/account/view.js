/** Account pages: profile.html (role-aware summary) and login.html (sample accounts, no passwords). */
import {escapeHtml as esc,icon} from '../../shared/ui.js';
import {accounts,roleLabels,roleHome} from '../../shared/accounts.js';
import {avatarMarkup} from '../../shared/shell.js';

export function renderProfile({user,summary=[],links=[]}){
  if(user.role==='visitor')return `<section class="access-panel"><span class="access-icon">${icon('user')}</span><h1>Hồ sơ cá nhân</h1><p>Đăng nhập bằng tài khoản câu lạc bộ cấp để xem hồ sơ và hoạt động của bạn.</p><div class="access-actions"><a class="button button-primary" href="login.html">Đăng nhập${icon('arrow')}</a></div></section>`;
  return `<section class="profile-card">
    ${avatarMarkup(user,88,'profile-avatar')}
    <div><p class="eyebrow">${esc(roleLabels[user.role])}</p><h1>${esc(user.name)}</h1><p>${esc(user.title||'')}${user.email?` · ${esc(user.email)}`:''}</p>${user.major?`<p class="muted-text">${esc(user.major)} · ${esc(user.year)}</p>`:''}</div>
  </section>
  <section class="page-section" aria-labelledby="summary-title"><h2 id="summary-title">Tổng quan</h2>
    <div class="stats-strip">${summary.map(s=>`<div class="stat-card"><div class="stat-top">${esc(s.label)}</div><span class="stat-value">${esc(s.value)}</span><span class="stat-context">${esc(s.context||'')}</span></div>`).join('')}</div>
  </section>
  ${links.length?`<section class="page-section" aria-labelledby="links-title"><h2 id="links-title">Đi nhanh</h2><div class="quick-links">${links.map(([i,href,label,text])=>`<a class="quick-link" href="${href}">${icon(i)}<span><strong>${label}</strong><small>${text}</small></span>${icon('arrow')}</a>`).join('')}</div></section>`:''}`;
}

export function renderLogin({user}){
  const group=role=>accounts.filter(a=>a.role===role).map(a=>`<li><button type="button" class="account-option${a.id===user.id?' current':''}" data-sign-in="${esc(a.id)}"${a.id===user.id?' aria-current="true"':''}>${avatarMarkup(a,48,'account-option-avatar')}<span><strong>${esc(a.name)}</strong><small>${esc(a.title)}</small></span>${a.id===user.id?'<span class="pill pill-published">Đang dùng</span>':icon('arrow')}</button></li>`).join('');
  return `<div class="login-wrap">
    <div class="page-heading"><div><h1>Đăng nhập ClubFlow</h1><p>Chọn tài khoản câu lạc bộ đã cấp sẵn. Mỗi vai trò chỉ thấy những trang và dữ liệu của mình.</p></div></div>
    <div class="login-grid">
      ${['executive','applicant','interviewer'].map(role=>`<section class="login-group" aria-labelledby="login-${role}"><h2 id="login-${role}">${roleLabels[role]}</h2><p>${{executive:'Tạo đợt tuyển, duyệt hồ sơ, xếp lịch và công bố kết quả.',applicant:'Nộp đơn, theo dõi hồ sơ, lịch phỏng vấn và kết quả.',interviewer:'Xem lịch được giao, CV và gửi đánh giá.'}[role]}</p><ul class="account-options">${group(role)}</ul></section>`).join('')}
    </div>
    ${user.role!=='visitor'?`<p class="login-current">Đang dùng: <strong>${esc(user.name)}</strong> (${esc(roleLabels[user.role])}). <a href="${roleHome[user.role]}">Về trang của tôi</a></p>`:''}
  </div>`;
}
