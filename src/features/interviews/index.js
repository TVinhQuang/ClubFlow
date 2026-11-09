/** Interviewer controller: assigned interviews and one assessment per interview. */
import {scheduleSnapshot,interviewStart} from '../schedule/snapshot.js';
import {localNow} from '../schedule/model.js';
import {accounts} from '../../shared/accounts.js';
import {renderInterviews,renderCandidateFile,renderAssessmentForm,renderAssessmentView} from './view.js';

/** Assigned rows for one interviewer in a confirmed schedule. */
export function buildInterviewItems(user,{rows,config,confirmedAt},assessments,now=localNow()){
  if(!confirmedAt)return [];
  return rows.filter(r=>r.assignment?.interviewerId===user.id).map(row=>({row,assessment:assessments.find(a=>a.applicationId===row.candidate.id)||null,canAssess:now>=interviewStart(config,row)}));
}

export function mount(container,services){
  const {ui,session,assessmentsStore,notifications,campaignStore}=services;
  const user=session.getUser();
  let snap,items;
  const positions=()=>{const s=snap.config.interviewers.find(i=>i.id===user.id);return (campaignStore.getPublished()?.positions||[]).filter(p=>s?.positionIds.includes(p.id)).map(p=>p.name);};
  const render=()=>{snap=scheduleSnapshot(services);items=buildInterviewItems(user,snap,assessmentsStore.getAll());container.innerHTML=renderInterviews({user,confirmed:Boolean(snap.confirmedAt),config:snap.config,items,positions:positions()});};
  render();
  const find=id=>items.find(i=>i.row.candidate.id===id);
  let assessing=null;
  const click=event=>{
    const cv=event.target.closest('[data-interview-cv]'),assess=event.target.closest('[data-interview-assess]'),view=event.target.closest('[data-interview-view]');
    if(cv){const c=find(cv.dataset.interviewCv)?.row.candidate;if(c)ui.openDialog({title:`Hồ sơ ${c.id} · ${c.name}`,body:renderCandidateFile(c),actions:'<button type="button" class="button button-secondary" data-action="close-dialog">Đóng</button>'});}
    if(view){const item=find(view.dataset.interviewView);if(item?.assessment)ui.openDialog({title:`Đánh giá ${item.row.candidate.name}`,body:renderAssessmentView(item.assessment),actions:'<button type="button" class="button button-secondary" data-action="close-dialog">Đóng</button>'});}
    if(assess){
      const item=find(assess.dataset.interviewAssess);if(!item||!item.canAssess||item.assessment)return;
      assessing=item.row.candidate.id;
      ui.openDialog({title:'Gửi đánh giá phỏng vấn',body:renderAssessmentForm(item.row.candidate),actions:'<button type="button" class="button button-secondary" data-action="close-dialog">Hủy</button><button type="button" class="button button-primary" data-assessment-submit>Gửi đánh giá</button>'});
    }
  };
  const dialogClick=event=>{
    if(!event.target.closest('[data-assessment-submit]'))return;
    const form=document.getElementById('assessment-form');if(!form)return;
    const data=new FormData(form);
    const result=assessmentsStore.submit({applicationId:assessing,interviewerId:user.id,score:Number(data.get('score')),strengths:String(data.get('strengths')||''),concerns:String(data.get('concerns')||''),recommendation:String(data.get('recommendation')||'')});
    for(const n of form.querySelectorAll('.field-error')){n.hidden=true;n.textContent='';}
    for(const n of form.querySelectorAll('[aria-invalid]'))n.removeAttribute('aria-invalid');
    if(!result.ok){
      for(const e of result.errors){const msg=document.getElementById(`assess-${e.field}-error`);if(msg){msg.textContent=e.message;msg.hidden=false;}document.getElementById(`assess-${e.field}`)?.setAttribute('aria-invalid','true');}
      const first=result.errors[0].field;(document.getElementById(`assess-${first}`)||form.querySelector(`[name="${first}"]`))?.focus();
      return;
    }
    const executive=accounts.find(a=>a.role==='executive');
    notifications.add([{userId:executive.id,message:`${user.name} đã gửi đánh giá ${assessing}.`,href:'results.html'}]);
    services.refreshNotifications?.();
    const id=assessing;ui.closeDialog();render();
    container.querySelector(`[data-interview-view="${CSS.escape(id)}"]`)?.focus();
    ui.toast(result.persisted?'Đã gửi đánh giá.':'Đã gửi trong tab này; trình duyệt chưa lưu được dữ liệu.');
  };
  const dialog=document.querySelector('#app-dialog');
  container.addEventListener('click',click);dialog.addEventListener('click',dialogClick);
  return ()=>{container.removeEventListener('click',click);dialog.removeEventListener('click',dialogClick);};
}
