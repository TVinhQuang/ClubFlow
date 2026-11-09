/** Owner: Nguyễn Thái Cường — 24127336. Screen 3 controller: interview scheduling. */
import {downloadCsv} from '../../shared/ui.js';
import {initialCampaign} from '../campaign/seed.js';
import {createScheduleStore} from './store.js';
import {initialApplicantAvailability} from './seed.js';
import {validateConfig,generateDraft,evaluateSchedule,computeStats,canConfirm,normalizeConfig} from './model.js';
import {renderSchedule,renderBoard,renderEditor,renderEditorCheck,renderConfirmSummary,scheduleCsvRows} from './view.js';

const errorTarget=field=>field.startsWith('interviewer.')?`schedule-iv-${field.slice(12)}`:{date:'schedule-date',start:'schedule-start',end:'schedule-end',duration:'schedule-duration',interviewers:'schedule-interviewers',rooms:'schedule-rooms'}[field];

export function mount(container,services){
  const {ui,campaignStore,applicationsStore}=services;
  let storage=null;try{storage=localStorage;}catch{}
  const store=services.scheduleStore||createScheduleStore(storage);
  const published=campaignStore?.getPublished?.()||null;
  const campaign=published||initialCampaign;
  const applications=()=>applicationsStore?.getAll?.()||[];
  const candidates=()=>applications().filter(a=>a.status==='shortlisted');
  const availability=initialApplicantAvailability;
  let config=store.getConfig(),assignments=store.getAssignments(),dirty=false,editing=null;

  const readOnly=()=>store.isConfirmed();
  const rows=()=>evaluateSchedule({candidates:candidates(),config,availability,assignments,confirmedAt:store.getMeta().confirmedAt});
  function renderAll(){const r=rows();container.innerHTML=renderSchedule({rows:r,stats:computeStats(r),campaign,config,meta:store.getMeta(),dirty});}
  function renderMain(){
    const r=rows(),main=container.querySelector('#schedule-main');
    if(main)main.innerHTML=renderBoard(r,computeStats(r),{readOnly:readOnly()});
    const state=container.querySelector('#schedule-save-state');
    if(state&&!readOnly())state.lastChild.textContent=dirty?'Có thay đổi chưa lưu':'Đã lưu nháp';
  }
  function markDirty(){dirty=true;renderMain();}

  function clearErrors(){
    for(const node of container.querySelectorAll('#schedule-config [aria-invalid]'))node.removeAttribute('aria-invalid');
    for(const node of container.querySelectorAll('#schedule-config .field-error')){node.hidden=true;node.textContent='';}
  }
  function showErrors(errors){
    clearErrors();
    for(const e of errors){
      const id=errorTarget(e.field),message=document.getElementById(`${id}-error`);
      document.getElementById(id)?.setAttribute('aria-invalid','true');
      if(message){message.textContent=message.textContent?`${message.textContent} ${e.message}`:e.message;message.hidden=false;}
    }
    document.getElementById(errorTarget(errors[0].field))?.focus();
    ui.toast(`Kiểm tra lại ${errors.length} thông tin cấu hình.`);
  }

  function updateConfig(input){
    const kind=input.dataset.config;if(!kind||readOnly())return;
    const next=structuredClone(config);
    if(['date','start','end'].includes(kind))next[kind]=input.value;
    else if(kind==='duration')next.duration=Number(input.value);
    else if(kind==='room')next.roomIds=[...container.querySelectorAll('[data-config="room"]:checked')].map(n=>n.value);
    else{
      const id=input.dataset.interviewer;let person=next.interviewers.find(i=>i.id===id);
      if(!person){person={id,positionIds:[],from:next.start,to:next.end};next.interviewers.push(person);}
      if(kind==='position')person.positionIds=[...container.querySelectorAll(`[data-config="position"][data-interviewer="${CSS.escape(id)}"]:checked`)].map(n=>n.value);
      else person[kind]=input.value;
    }
    config=normalizeConfig(next);input.removeAttribute('aria-invalid');markDirty();
  }

  function generate(){
    const errors=validateConfig(config,campaign);
    if(errors.length){showErrors(errors);return;}
    clearErrors();
    const run=()=>{
      const result=generateDraft({candidates:candidates(),config,availability});
      assignments=result.assignments;markDirty();
      const s=computeStats(rows());
      ui.toast(`Đã tạo lịch nháp: ${s.proposed} đề xuất, ${s.unassigned} chưa xếp. Nhấn Lưu thay đổi để lưu.`);
      container.querySelector('#schedule-board-title')?.scrollIntoView({block:'start',behavior:'smooth'});
    };
    if(!assignments.length){run();return;}
    pendingGenerate=run;
    ui.openDialog({title:'Tạo lại lịch nháp?',body:'<p>Lịch nháp hiện tại, kể cả các chỉnh sửa tay, sẽ được thay bằng lịch tạo tự động theo cấu hình mới.</p>',actions:'<button type="button" class="button button-secondary" data-action="close-dialog">Giữ lịch hiện tại</button><button type="button" class="button button-primary" data-schedule-dialog="generate">Tạo lại lịch</button>'});
  }
  let pendingGenerate=null;

  const tentative=()=>{
    const form=document.getElementById('schedule-editor');if(!form)return null;
    const value=key=>form.querySelector(`[data-editor="${key}"]`)?.value||'';
    return {applicationId:form.dataset.app,start:value('start'),interviewerId:value('interviewerId'),roomId:value('roomId')};
  };
  function checkTentative(){
    const next=tentative(),out=document.getElementById('editor-check');if(!next||!out)return;
    if(!next.start||!next.interviewerId||!next.roomId){out.innerHTML=renderEditorCheck(null);return;}
    const trial=[...assignments.filter(a=>a.applicationId!==next.applicationId),next];
    const row=evaluateSchedule({candidates:candidates(),config,availability,assignments:trial}).find(r=>r.candidate.id===next.applicationId);
    out.innerHTML=renderEditorCheck(row?.issues||[]);
  }
  function openEditor(id){
    const row=rows().find(r=>r.candidate.id===id);if(!row)return;
    editing=id;
    const title=row.status==='unassigned'?'Gán lịch phỏng vấn':row.status==='conflict'?'Giải quyết xung đột':'Sửa lịch phỏng vấn';
    ui.openDialog({title,body:renderEditor(row,{config,check:row.assignment?row.issues:null}),actions:`${row.assignment?'<button type="button" class="button button-quiet danger" data-schedule-dialog="unassign">Bỏ lịch</button>':''}<button type="button" class="button button-secondary" data-action="close-dialog">Hủy</button><button type="button" class="button button-primary" data-schedule-dialog="apply">Áp dụng</button>`});
    document.getElementById('editor-start')?.focus();
  }
  function afterEdit(message){
    const id=editing;ui.closeDialog();markDirty();ui.toast(message);
    (container.querySelector(`[data-schedule-edit="${CSS.escape(id)}"]`)||container.querySelector('#schedule-board-title'))?.focus();
  }

  function save(){
    const ids=new Set(candidates().map(c=>c.id));
    assignments=assignments.filter(a=>ids.has(a.applicationId));
    const result=store.saveDraft({config,assignments});
    if(!result.ok){ui.toast(result.error);return;}
    dirty=false;renderAll();container.querySelector('#schedule-save')?.focus();
    ui.toast(result.persisted?'Đã lưu lịch nháp trên trình duyệt này.':'Lịch nháp đang giữ trong tab; trình duyệt chưa lưu được dữ liệu.');
  }
  function openConfirm(){
    const r=rows(),result=canConfirm({rows:r,campaign:published,applications:applications(),config});
    ui.openDialog({title:'Duyệt & xác nhận lịch',body:renderConfirmSummary(computeStats(r),result.blockers,config),actions:`<button type="button" class="button button-secondary" data-action="close-dialog">Quay lại chỉnh sửa</button><button type="button" class="button button-primary" data-schedule-dialog="confirm"${result.ok?'':' disabled'}>Xác nhận lịch</button>`});
  }
  function confirm(){
    const r=rows();
    if(!canConfirm({rows:r,campaign:published,applications:applications(),config}).ok){ui.closeDialog();return;}
    const result=store.confirm({config,assignments});
    ui.closeDialog();dirty=false;renderAll();
    ui.toast(result.persisted?'Đã xác nhận lịch phỏng vấn.':'Đã xác nhận trong tab này; trình duyệt chưa lưu được dữ liệu.');
    container.querySelector('h1')?.focus?.();
  }

  const click=event=>{
    const edit=event.target.closest('[data-schedule-edit]');
    if(edit){if(!readOnly())openEditor(edit.dataset.scheduleEdit);return;}
    const action=event.target.closest('[data-schedule-action]')?.dataset.scheduleAction;
    if(action==='export'){downloadCsv(`clubflow-lich-phong-van-${config.date||'nhap'}.csv`,scheduleCsvRows(rows()));ui.toast('Đã xuất bảng lịch (CSV).');}
    if(action==='save')save();
    if(action==='confirm')openConfirm();
    const link=event.target.closest('#schedule-alerts a');
    if(link){event.preventDefault();const row=document.getElementById(link.getAttribute('href').slice(1));row?.scrollIntoView({block:'center',behavior:'smooth'});row?.querySelector('button')?.focus({preventScroll:true});}
  };
  const dialogClick=event=>{
    const action=event.target.closest('[data-schedule-dialog]')?.dataset.scheduleDialog;if(!action)return;
    if(action==='generate'){ui.closeDialog();pendingGenerate?.();pendingGenerate=null;}
    if(action==='confirm')confirm();
    if(action==='unassign'){assignments=assignments.filter(a=>a.applicationId!==editing);afterEdit(`Đã bỏ lịch của ${editing}.`);}
    if(action==='apply'){
      const next=tentative();
      if(!next?.start||!next.interviewerId||!next.roomId){const out=document.getElementById('editor-check');if(out)out.innerHTML='<p class="schedule-bad">Chọn đủ giờ, người phỏng vấn và phòng.</p>';return;}
      assignments=[...assignments.filter(a=>a.applicationId!==next.applicationId),next];
      const row=rows().find(r=>r.candidate.id===next.applicationId);
      afterEdit(row?.status==='conflict'?`${next.applicationId} vẫn còn xung đột, hãy kiểm tra lại.`:`Đã cập nhật lịch ${next.applicationId}.`);
    }
  };
  const dialogChange=event=>{if(event.target.closest('#schedule-editor'))checkTentative();};
  const change=event=>updateConfig(event.target);
  const submit=event=>{if(event.target.id!=='schedule-config')return;event.preventDefault();generate();};
  const beforeUnload=event=>{if(dirty){event.preventDefault();event.returnValue='';}};

  renderAll();
  const dialog=document.querySelector('#app-dialog');
  container.addEventListener('click',click);container.addEventListener('change',change);container.addEventListener('submit',submit);
  dialog.addEventListener('click',dialogClick);dialog.addEventListener('change',dialogChange);window.addEventListener('beforeunload',beforeUnload);
  return ()=>{
    container.removeEventListener('click',click);container.removeEventListener('change',change);container.removeEventListener('submit',submit);
    dialog.removeEventListener('click',dialogClick);dialog.removeEventListener('change',dialogChange);window.removeEventListener('beforeunload',beforeUnload);
  };
}
