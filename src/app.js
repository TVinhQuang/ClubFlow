import {createUi,icon,escapeHtml as esc,formatDateTime} from './shared/ui.js';
import {createSession} from './shared/session.js';
import {roleLabels,roleHome} from './shared/accounts.js';
import {createNotifications} from './shared/notifications.js';
import {renderAccountTrigger,renderAccountMenu,ctaFor} from './shared/shell.js';
import {createCampaignStore} from './features/campaign/store.js';
import {createApplicationsStore} from './features/applications/store.js';
import {createScheduleStore} from './features/schedule/store.js';
import {createAssessmentsStore} from './features/interviews/store.js';
import {createResultsStore} from './features/results/store.js';
import {mount as mountCampaign} from './features/campaign/controller.js';
import {mount as mountApplications} from './features/applications/index.js';
import {mount as mountSchedule} from './features/schedule/index.js';
import {mount as mountResults} from './features/results/index.js';
import {mount as mountInterviews} from './features/interviews/index.js';
import {mount as mountApply,mountMine} from './features/applicant/index.js';
import {mount as mountPublic} from './features/public/index.js';
import {mount as mountAccount} from './features/account/index.js';

const ui=createUi();
let storage=null;try{storage=localStorage;}catch{}
const session=createSession(storage);
const notifications=createNotifications(storage);
const applicationsStore=createApplicationsStore(storage);
const getApplications=()=>applicationsStore.getAll();
const campaignStore=createCampaignStore(storage,{getApplications});
const scheduleStore=createScheduleStore(storage);
const assessmentsStore=createAssessmentsStore(storage);
const resultsStore=createResultsStore(storage);
const services={ui,session,notifications,campaignStore,applicationsStore,scheduleStore,assessmentsStore,resultsStore,getApplications};

const user=session.getUser();
const view=document.body.dataset.view||'campaign';
const roles=(document.body.dataset.roles||'').split(' ').filter(Boolean);
const main=document.querySelector('#main');
const mounts={login:mountAccount,profile:mountAccount,campaign:mountCampaign,applications:mountApplications,schedule:mountSchedule,results:mountResults,interviews:mountInterviews,apply:mountApply,mine:mountMine};
let cleanup=null;
if(roles.length&&!roles.includes(user.role)){
  const allowed=roles.map(r=>roleLabels[r]).join(' hoặc ');
  main.innerHTML=`<section class="access-panel"><span class="access-icon">${icon('lock')}</span><h1>Trang này dành cho ${esc(allowed)}</h1><p>Bạn đang dùng ${user.role==='visitor'?'chế độ khách':`tài khoản ${esc(user.name)} (${esc(roleLabels[user.role])})`}. Hãy đăng nhập bằng tài khoản phù hợp hoặc quay về trang của bạn.</p><div class="access-actions"><a class="button button-primary" href="login.html">Đổi tài khoản${icon('arrow')}</a><a class="button button-secondary" href="${roleHome[user.role]}">Về trang của tôi</a></div></section>`;
  for(const id of ['workspace-context','workspace-workflow'])document.getElementById(id).hidden=true;
}else cleanup=(mounts[view]||mountPublic)(main,services);
document.documentElement.classList.remove('no-js');
if(document.documentElement.classList.contains('page-enter'))setTimeout(()=>document.documentElement.classList.remove('page-enter'),600);

/*
 * Scroll and pointer presence for reading pages. Management screens re-render after every edit, so they are
 * excluded: only nodes present now are observed, and anything rendered later is simply visible.
 */
const calmMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(['discover','recruitment','events','profile','login','mine','interviews'].includes(view)&&!calmMotion&&'IntersectionObserver' in window){
  const items=[...main.querySelectorAll('.role-grid > li, .journey > li, .faq-item, .position-card, .timeline-item, .now-card, .cta-band, .mine-card, .interview-card, .login-group, .quick-link, .info-panel')]
    .filter(el=>el.getBoundingClientRect().top>window.innerHeight*.92);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}},{rootMargin:'0px 0px -6% 0px'});
  for(const el of items){
    el.style.setProperty('--reveal-delay',`${Math.min([...el.parentElement.children].indexOf(el),5)*40}ms`);
    el.classList.add('reveal');observer.observe(el);
  }
}
if(matchMedia('(hover: hover) and (pointer: fine)').matches&&!calmMotion){
  for(const panel of main.querySelectorAll('.hero-panel')){
    let frame=0;
    panel.addEventListener('pointermove',event=>{
      if(frame)return;
      frame=requestAnimationFrame(()=>{const r=panel.getBoundingClientRect();panel.style.setProperty('--mx',`${event.clientX-r.left}px`);panel.style.setProperty('--my',`${event.clientY-r.top}px`);frame=0;});
    });
    panel.addEventListener('pointerenter',()=>panel.classList.add('is-pointer'));
    panel.addEventListener('pointerleave',()=>panel.classList.remove('is-pointer'));
  }
}

/* Header reflects the active sample account. */
const header=document.querySelector('#site-header'),workflow=document.querySelector('#workspace-workflow');
const accountButton=document.querySelector('#account-trigger'),account=document.querySelector('#account-menu');
const menu=document.querySelector('#site-navigation'),menuButton=document.querySelector('[data-action="menu"]');
const notifyWrap=document.querySelector('#notify-wrap'),notifyButton=document.querySelector('#notify-trigger'),notifyPanel=document.querySelector('#notify-panel'),notifyCount=document.querySelector('#notify-count');
accountButton.innerHTML=renderAccountTrigger(user);accountButton.setAttribute('aria-label',`Tài khoản ${user.name}`);
account.innerHTML=renderAccountMenu(user);
const [ctaHref,ctaLabel]=ctaFor(user),cta=document.querySelector('#header-cta');cta.href=ctaHref;cta.innerHTML=`${esc(ctaLabel)}${icon('arrow')}`;
function renderNotifications(){
  if(user.role==='visitor'){notifyWrap.hidden=true;return;}
  notifyWrap.hidden=false;
  const unread=notifications.unread(user.id),list=notifications.list(user.id);
  notifyCount.textContent=unread>9?'9+':String(unread);notifyCount.hidden=!unread;
  notifyButton.setAttribute('aria-label',unread?`Thông báo, ${unread} chưa đọc`:'Thông báo, không có thông báo mới');
  notifyPanel.innerHTML=`<div class="notify-head"><strong>Thông báo</strong>${unread?'<button type="button" class="button button-quiet button-small" data-action="notifications-read">Đánh dấu đã đọc</button>':''}</div>${list.length?`<ul class="notify-list">${list.slice(0,8).map(n=>`<li class="${n.read?'':'unread'}">${n.href?`<a href="${esc(n.href)}">`:'<div>'}<span>${esc(n.message)}</span><small>${esc(formatDateTime(n.createdAt))}</small>${n.href?'</a>':'</div>'}</li>`).join('')}</ul>`:'<p class="notify-empty">Chưa có thông báo nào.</p>'}`;
}
renderNotifications();
services.refreshNotifications=renderNotifications;

function measureShell(){
  const style=document.documentElement.style;
  style.setProperty('--header-height',`${header.offsetHeight}px`);
  style.setProperty('--workflow-height',`${workflow.offsetHeight}px`);
}
if('ResizeObserver' in window){const observer=new ResizeObserver(measureShell);observer.observe(header);observer.observe(workflow);}else window.addEventListener('resize',measureShell);
measureShell();
function closeMenus(){
  menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');
  account.hidden=true;accountButton.setAttribute('aria-expanded','false');
  notifyPanel.hidden=true;notifyButton.setAttribute('aria-expanded','false');
}
function setTheme(theme){document.documentElement.dataset.theme=theme;document.querySelector('#theme-toggle').setAttribute('aria-pressed',String(theme==='dark'));document.querySelector('#theme-toggle').setAttribute('aria-label',theme==='dark'?'Chuyển sang giao diện sáng':'Chuyển sang giao diện tối');document.querySelector('#theme-toggle').title=theme==='dark'?'Giao diện sáng':'Giao diện tối';try{storage?.setItem('clubflow.theme',theme);}catch{}}
let theme='light';try{theme=storage?.getItem('clubflow.theme')==='dark'?'dark':'light';}catch{}setTheme(theme);
document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='menu'){const open=!menu.classList.contains('is-open');closeMenus();menu.classList.toggle('is-open',open);menuButton.setAttribute('aria-expanded',String(open));}
  else if(action==='account'){const open=account.hidden;closeMenus();account.hidden=!open;accountButton.setAttribute('aria-expanded',String(open));}
  else if(action==='notifications'){const open=notifyPanel.hidden;closeMenus();notifyPanel.hidden=!open;notifyButton.setAttribute('aria-expanded',String(open));}
  else if(action==='notifications-read'){notifications.markAllRead(user.id);renderNotifications();notifyPanel.hidden=false;notifyButton.focus();}
  else if(action==='theme'){setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');}
  else if(action==='sign-out'){session.signOut();window.location.href='discover.html';}
  if(!event.target.closest('.account-wrap')&&action!=='account'){account.hidden=true;accountButton.setAttribute('aria-expanded','false');}
  if(!event.target.closest('.notify-wrap')&&action!=='notifications'){notifyPanel.hidden=true;notifyButton.setAttribute('aria-expanded','false');}
  if(!event.target.closest('#site-navigation')&&action!=='menu'){menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const focus=!account.hidden?accountButton:!notifyPanel.hidden?notifyButton:menu.classList.contains('is-open')?menuButton:null;closeMenus();focus?.focus();}});
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>24),{passive:true});
window.addEventListener('pagehide',event=>{if(!event.persisted){cleanup?.();ui.destroy();}});
