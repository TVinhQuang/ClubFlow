/** Role-aware pieces of the shared header, used at build time (layout.js) and at runtime (app.js). */
import {icon,escapeHtml as esc} from './ui.js';
import {roleLabels} from './accounts.js';

const menuLinks={
  executive:[['user','profile.html','Hồ sơ cá nhân'],['grid','index.html','Không gian quản lý CLB'],['trophy','results.html','Kết quả tuyển']],
  applicant:[['user','profile.html','Hồ sơ cá nhân'],['file','my-applications.html','Hồ sơ ứng tuyển của tôi'],['upload','apply.html','Nộp đơn ứng tuyển']],
  interviewer:[['user','profile.html','Hồ sơ cá nhân'],['calendar','interviews.html','Lịch phỏng vấn của tôi']],
  visitor:[]
};
const cta={
  executive:['index.html','Không gian CLB'],applicant:['my-applications.html','Hồ sơ của tôi'],
  interviewer:['interviews.html','Lịch phỏng vấn'],visitor:['login.html','Đăng nhập']
};

export function avatarMarkup(user,size=40,className='account-avatar'){
  return user.avatar
    ?`<img class="${className}" src="${esc(user.avatar)}" alt="" width="${size}" height="${size}">`
    :`<span class="${className} account-initials" aria-hidden="true">${esc(user.initials||'?')}</span>`;
}
export function renderAccountTrigger(user){
  return `${avatarMarkup(user)}<span class="account-label"><strong>${esc(user.name)}</strong><small>${esc(roleLabels[user.role])}</small></span>${icon('down')}`;
}
export function renderAccountMenu(user){
  const links=(menuLinks[user.role]||[]).map(([i,href,label])=>`<a class="account-menu-item" href="${href}">${icon(i)}${label}</a>`).join('');
  const signed=user.role!=='visitor';
  return `<div class="account-menu-head">${avatarMarkup(user,44,'account-menu-avatar')}<strong>${esc(user.name)}</strong><p>${esc(roleLabels[user.role])} · ${esc(user.title||'')}</p></div>
    ${links}
    <a class="account-menu-item" href="login.html">${icon('users')}${signed?'Đổi tài khoản':'Đăng nhập'}</a>
    <hr class="account-menu-divider">
    <button type="button" class="account-menu-item" data-action="theme">${icon('moon')}Đổi chế độ sáng / tối</button>
    ${signed?`<button type="button" class="account-menu-item account-menu-danger" data-action="sign-out">${icon('logout')}Đăng xuất</button>`:''}`;
}
export function ctaFor(user){return cta[user.role]||cta.visitor;}
