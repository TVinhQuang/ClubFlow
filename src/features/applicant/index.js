/** Applicant controllers: apply.html and my-applications.html. */
import {getIntakeStatus} from '../campaign/model.js';
import {escapeHtml as esc} from '../../shared/ui.js';
import {scheduleSnapshot} from '../schedule/snapshot.js';
import {interviewerName,roomName} from '../schedule/model.js';
import {validateApplication,mergeBlocks,countWords,MAX_WORDS} from './model.js';
import {renderApply,renderApplySuccess,renderMine} from './view.js';
import {accounts} from '../../shared/accounts.js';

const colors=['mint','blue','peach','lavender'];

/** Cards for one applicant: CV status, confirmed interview and published result. */
export function buildMineItems(user,{applications,rows,config,confirmedAt},{decisions={},publishedAt=null}={}){
  return applications.filter(a=>a.studentId===user.studentId).sort((a,b)=>a.submitted.localeCompare(b.submitted)).map(application=>{
    const row=confirmedAt?rows.find(r=>r.candidate.id===application.id&&r.assignment):null;
    return {application,scheduleConfirmed:Boolean(confirmedAt),
      interview:row?{date:config.date,start:row.assignment.start,end:row.end,room:roomName(row.assignment.roomId),interviewer:interviewerName(row.assignment.interviewerId)}:null,
      result:publishedAt?decisions[application.id]||null:null};
  });
}

export function mountMine(container,services){
  const user=services.session.getUser();
  const items=buildMineItems(user,scheduleSnapshot(services),{decisions:services.resultsStore.getDecisions(),publishedAt:services.resultsStore.getPublishedAt()});
  container.innerHTML=renderMine({user,items});
  const target=location.hash&&document.getElementById(location.hash.slice(1));
  if(target){target.scrollIntoView({block:'center'});target.focus({preventScroll:true});}
  return ()=>{};
}

export function mount(container,services){
  const {ui,session,applicationsStore,campaignStore,notifications}=services;
  const user=session.getUser();
  const campaign=campaignStore.getPublished();
  const intake=campaign?getIntakeStatus(campaign,{published:true}):'draft';
  const config=services.scheduleStore.getConfig();
  const mine=()=>applicationsStore.getAll().filter(a=>a.studentId===user.studentId);
  // Arriving from "Ứng tuyển vị trí này" preselects that position (redundant-entry: don't make people pick it twice).
  const requested=new URLSearchParams(location.search).get('position');
  let values=campaign?.positions.some(p=>p.id===requested)?{positionId:requested}:{};
  const render=()=>{container.innerHTML=renderApply({campaign,intake,user,mine:mine(),config,values});};
  render();

  const read=form=>{
    const data=new FormData(form),file=form.querySelector('#apply-cv').files?.[0]||null;
    return {positionId:String(data.get('positionId')||''),name:String(data.get('name')||''),email:String(data.get('email')||''),year:String(data.get('year')||''),major:String(data.get('major')||''),motivation:String(data.get('motivation')||''),availability:data.getAll('availability').map(String),cv:file?{name:file.name,size:file.size,type:file.type}:null};
  };
  function showErrors(errors){
    const summary=container.querySelector('#apply-errors');
    for(const n of container.querySelectorAll('[aria-invalid]'))n.removeAttribute('aria-invalid');
    for(const n of container.querySelectorAll('.field-error')){n.hidden=true;n.textContent='';}
    summary.innerHTML=`<strong>Kiểm tra lại ${errors.length} thông tin trước khi nộp</strong><ul>${errors.map(e=>`<li><a href="#apply-${e.field==='form'?'positionId':e.field}">${esc(e.message)}</a>${e.href?` <a class="error-open" href="${esc(e.href)}">Mở hồ sơ đã nộp</a>`:''}</li>`).join('')}</ul>`;
    summary.hidden=false;
    for(const e of errors){
      const input=document.getElementById(`apply-${e.field}`),message=document.getElementById(`apply-${e.field}-error`);
      input?.setAttribute('aria-invalid','true');if(message){message.textContent=e.message;message.hidden=false;}
    }
    summary.focus();
  }
  const submit=event=>{
    if(event.target.id!=='apply-form')return;event.preventDefault();
    const v=read(event.target);values={...v,cv:null};
    const position=campaign?.positions.find(p=>p.id===v.positionId);
    const duplicate=position?applicationsStore.findDuplicate(user.studentId,v.positionId):null;
    const errors=validateApplication(v,{campaign,intake,duplicate});
    if(errors.length){showErrors(errors);return;}
    const now=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()).replace(' ','T');
    const result=applicationsStore.create({
      studentId:user.studentId,name:v.name.trim(),email:v.email.trim(),initials:user.initials,color:colors[mine().length%colors.length],
      positionId:position.id,role:position.name,department:position.department,submitted:now,year:v.year,major:v.major.trim(),
      sop:v.motivation.trim(),cv:v.cv.name,cvSize:v.cv.size,availability:mergeBlocks(v.availability)
    });
    if(!result.ok){showErrors([{field:'positionId',message:`Bạn đã nộp hồ sơ ${result.duplicate.id} cho vị trí này.`,href:`my-applications.html#app-${result.duplicate.id}`}]);return;}
    const executive=accounts.find(a=>a.role==='executive');
    notifications.add([
      {userId:user.id,message:`Đã nhận hồ sơ ${result.application.id} — ${position.name}.`,href:`my-applications.html#app-${result.application.id}`},
      {userId:executive.id,message:`Hồ sơ mới ${result.application.id}: ${v.name.trim()} ứng tuyển ${position.name}.`,href:'applications.html'}
    ]);
    services.refreshNotifications?.();
    container.innerHTML=renderApplySuccess(result.application);
    container.querySelector('#apply-success')?.focus();
    ui.toast(`Đã nộp hồ sơ ${result.application.id}.`);
  };
  const input=event=>{
    if(event.target.id==='apply-motivation'){
      const words=countWords(event.target.value),counter=container.querySelector('#apply-motivation-count');
      counter.textContent=`${words}/${MAX_WORDS} từ`;counter.classList.toggle('over',words>MAX_WORDS);
    }
  };
  const errorLink=event=>{
    const link=event.target.closest('#apply-errors a:not(.error-open)');if(!link)return;
    event.preventDefault();const target=document.getElementById(link.getAttribute('href').slice(1));target?.focus();target?.scrollIntoView({block:'center',behavior:'smooth'});
  };
  container.addEventListener('submit',submit);container.addEventListener('input',input);container.addEventListener('click',errorLink);
  return ()=>{container.removeEventListener('submit',submit);container.removeEventListener('input',input);container.removeEventListener('click',errorLink);};
}
