import {createUi} from './shared/ui.js';
import {createCampaignStore} from './features/campaign/store.js';
import {createApplicationsStore} from './features/applications/store.js';
import {mount as mountCampaign} from './features/campaign/controller.js';
import {mount as mountApplications} from './features/applications/index.js';
import {mount as mountSchedule} from './features/schedule/index.js';
import {mount as mountPublic} from './features/public/index.js';

const ui=createUi();
let storage=null;try{storage=localStorage;}catch{}
const applicationsStore=createApplicationsStore(storage);
const getApplications=()=>applicationsStore.getAll();
const campaignStore=createCampaignStore(storage,{getApplications});
const services={ui,campaignStore,applicationsStore,getApplications};
const view=document.body.dataset.view||'campaign';
const mount={campaign:mountCampaign,applications:mountApplications,schedule:mountSchedule}[view]||mountPublic;
const cleanup=mount(document.querySelector('#main'),services);
document.documentElement.classList.remove('no-js');
const header=document.querySelector('#site-header'),workflow=document.querySelector('#workspace-workflow');
function measureShell(){
  const style=document.documentElement.style;
  style.setProperty('--header-height',`${header.offsetHeight}px`);
  style.setProperty('--workflow-height',`${workflow.offsetHeight}px`);
}
if('ResizeObserver' in window){const observer=new ResizeObserver(measureShell);observer.observe(header);observer.observe(workflow);}else window.addEventListener('resize',measureShell);
measureShell();
const menu=document.querySelector('#site-navigation'),menuButton=document.querySelector('[data-action="menu"]');
const account=document.querySelector('#account-menu'),accountButton=document.querySelector('#account-trigger');
function closeMenus(){menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');account.hidden=true;accountButton.setAttribute('aria-expanded','false');}
function setTheme(theme){document.documentElement.dataset.theme=theme;document.querySelector('#theme-toggle').setAttribute('aria-pressed',String(theme==='dark'));document.querySelector('#theme-toggle').setAttribute('aria-label',theme==='dark'?'Chuyển sang giao diện sáng':'Chuyển sang giao diện tối');try{storage?.setItem('clubflow.theme',theme);}catch{}}
let theme='light';try{theme=storage?.getItem('clubflow.theme')==='dark'?'dark':'light';}catch{}setTheme(theme);
document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='menu'){const open=menu.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));account.hidden=true;accountButton.setAttribute('aria-expanded','false');}
  else if(action==='account'){account.hidden=!account.hidden;accountButton.setAttribute('aria-expanded',String(!account.hidden));menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');}
  else if(action==='theme'){setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');}
  if(!event.target.closest('.account-wrap')&&action!=='account'){account.hidden=true;accountButton.setAttribute('aria-expanded','false');}
  if(!event.target.closest('#site-navigation')&&action!=='menu'){menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const focus=!account.hidden?accountButton:menu.classList.contains('is-open')?menuButton:null;closeMenus();focus?.focus();}});
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>24),{passive:true});
window.addEventListener('pagehide',event=>{if(!event.persisted){cleanup?.();ui.destroy();}});
