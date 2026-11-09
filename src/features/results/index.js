/** Executive controller for results.html. */
import {scheduleSnapshot} from '../schedule/snapshot.js';
import {accounts} from '../../shared/accounts.js';
import {initialCampaign} from '../campaign/seed.js';
import {renderResults,quotaSummary,publishBlockers} from './view.js';
import {decisionLabels} from './store.js';

export function buildResultItems({rows,confirmedAt},assessments){
  if(!confirmedAt)return [];
  return rows.filter(r=>r.assignment).map(row=>({row,assessment:assessments.find(a=>a.applicationId===row.candidate.id)||null}));
}

export function mount(container,services){
  const {ui,resultsStore,assessmentsStore,notifications,campaignStore}=services;
  const campaign=campaignStore.getPublished()||initialCampaign;
  let items=[],snap;
  const render=()=>{
    snap=scheduleSnapshot(services);items=buildResultItems(snap,assessmentsStore.getAll());
    container.innerHTML=renderResults({confirmed:Boolean(snap.confirmedAt),config:snap.config,items,decisions:resultsStore.getDecisions(),publishedAt:resultsStore.getPublishedAt(),campaign});
  };
  render();
  const click=event=>{
    const decide=event.target.closest('[data-decide]');
    if(decide){
      const id=decide.dataset.decide,value=decide.getAttribute('aria-pressed')==='true'?null:decide.dataset.value;
      const result=resultsStore.setDecision(id,value);if(!result.ok){ui.toast(result.error);return;}
      render();container.querySelector(`[data-decide="${CSS.escape(id)}"][data-value="${decide.dataset.value}"]`)?.focus();
      ui.toast(value?`${id}: ${decisionLabels[value]}.`:`Đã bỏ quyết định của ${id}.`);
      return;
    }
    if(event.target.closest('[data-results-publish]')){
      const decisions=resultsStore.getDecisions(),blockers=publishBlockers(items,decisions,quotaSummary(campaign,items,decisions));
      if(blockers.length){ui.toast(blockers[0]);return;}
      ui.openDialog({title:'Công bố kết quả?',body:`<p>${items.filter(i=>decisions[i.row.candidate.id]==='pass').length} hồ sơ Đạt, ${items.filter(i=>decisions[i.row.candidate.id]==='fail').length} hồ sơ Không đạt. Ứng viên sẽ nhận thông báo trong ứng dụng; không có email nào được gửi. Sau khi công bố, quyết định không thể sửa.</p>`,actions:'<button type="button" class="button button-secondary" data-action="close-dialog">Xem lại</button><button type="button" class="button button-primary" data-results-confirm>Công bố</button>'});
    }
  };
  const dialogClick=event=>{
    if(!event.target.closest('[data-results-confirm]'))return;
    const decisions=resultsStore.getDecisions(),result=resultsStore.publish();
    if(!result.ok){ui.closeDialog();ui.toast(result.error);return;}
    const messages=items.map(({row})=>{
      const account=accounts.find(a=>a.role==='applicant'&&a.studentId===row.candidate.studentId);
      return account?{userId:account.id,message:`Kết quả ${row.candidate.role} (${row.candidate.id}): ${decisionLabels[decisions[row.candidate.id]]}.`,href:`my-applications.html#app-${row.candidate.id}`}:null;
    }).filter(Boolean);
    notifications.add(messages);services.refreshNotifications?.();
    ui.closeDialog();render();container.querySelector('h1')?.scrollIntoView({block:'start'});
    ui.toast(result.persisted?'Đã công bố kết quả trong ứng dụng.':'Đã công bố trong tab này; trình duyệt chưa lưu được dữ liệu.');
  };
  const dialog=document.querySelector('#app-dialog');
  container.addEventListener('click',click);dialog.addEventListener('click',dialogClick);
  return ()=>{container.removeEventListener('click',click);dialog.removeEventListener('click',dialogClick);};
}
