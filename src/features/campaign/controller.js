import {renderCampaign,renderPreview,fieldId} from './view.js';
import {canRemovePosition,normalizeCampaign} from './model.js';
import {escapeHtml} from '../../shared/ui.js';

const WORKING_KEY='clubflow.pa2.campaign.working.v1';
export function mount(container,{campaignStore:store,ui,getApplications=()=>[]}){
  let campaign=store.getDraft(),dirty=false,workingSaved=false;
  let session=null;
  try{
    session=sessionStorage;
    const raw=session.getItem(WORKING_KEY);
    if(raw){const saved=JSON.parse(raw);if(saved?.schemaVersion===1&&saved.campaign?.id===campaign.id&&Array.isArray(saved.campaign.positions)&&saved.savedAt===store.getMeta().persistedSavedAt){campaign=normalizeCampaign(saved.campaign);dirty=JSON.stringify(campaign)!==JSON.stringify(store.getDraft());workingSaved=true;}}
  }catch{}
  const remember=()=>{
    try{if(!session)throw Error('No session storage');session.setItem(WORKING_KEY,JSON.stringify({schemaVersion:1,campaign,savedAt:store.getMeta().persistedSavedAt}));workingSaved=true;}catch{workingSaved=false;}
  };
  function render({focusId,openIds}={}){
    container.innerHTML=renderCampaign(campaign,{...store.getMeta(),dirty});
    if(openIds)for(const details of container.querySelectorAll('[data-position-panel]'))details.open=openIds.has(details.dataset.positionPanel);
    if(focusId)document.getElementById(focusId)?.focus({preventScroll:true});
  }
  const expanded=()=>new Set([...container.querySelectorAll('[data-position-panel][open]')].map(node=>node.dataset.positionPanel));
  const clearErrors=()=>{
    for(const input of container.querySelectorAll('[aria-invalid]'))input.removeAttribute('aria-invalid');
    for(const error of container.querySelectorAll('.field-error')){error.hidden=true;error.textContent='';}
    const summary=document.getElementById('campaign-errors');summary.hidden=true;summary.innerHTML='';
  };
  function showErrors(errors){
    clearErrors();
    const summary=document.getElementById('campaign-errors');
    summary.innerHTML=`<strong>Kiểm tra lại ${errors.length} thông tin trước khi công bố</strong><ul>${errors.map(error=>`<li><a href="#${escapeHtml(fieldId(error.field))}">${escapeHtml(error.message)}</a></li>`).join('')}</ul>`;summary.hidden=false;
    for(const error of errors){
      const id=fieldId(error.field),input=document.getElementById(id),message=document.getElementById(`${id}-error`);
      input?.setAttribute('aria-invalid','true');if(message){message.textContent=error.message;message.hidden=false;}
      const details=input?.closest('[data-position-panel]');if(details)details.open=true;
    }
    const first=document.getElementById(fieldId(errors[0].field));
    (first||summary).focus();(first||summary).scrollIntoView({block:'center',behavior:'smooth'});
    ui.toast('Chưa công bố. Hãy sửa các thông tin đang được đánh dấu.');
  }
  function updateLive(input){
    const key=input.dataset.field;if(!key)return;
    const position=input.dataset.position&&campaign.positions.find(p=>p.id===input.dataset.position);
    if(input.dataset.position&&!position)return;
    const target=position||campaign;
    target[key]=key==='quota'?(input.value===''?'':Number(input.value)):input.value;
    dirty=JSON.stringify(normalizeCampaign(campaign))!==JSON.stringify(normalizeCampaign(store.getDraft()));remember();
    document.getElementById('campaign-live-preview').innerHTML=renderPreview(campaign);
    const status=container.querySelector('.campaign-status');
    let edited=status.querySelector('.campaign-dirty');
    const changed=dirty||store.getMeta().hasUnpublishedChanges;
    if(changed&&!edited){edited=document.createElement('span');edited.className='campaign-dirty';status.append(edited);}
    if(edited){edited.textContent=store.getPublished()?'Có thay đổi chưa công bố':'Đang chỉnh sửa bản nháp';edited.hidden=!changed;}
    const saved=document.getElementById('campaign-save-state');saved.textContent=dirty?'Có thay đổi chưa lưu bản nháp':store.getMeta().persisted===false?'Chưa lưu được trên trình duyệt này':store.getMeta().savedAt?'Đã lưu trên trình duyệt này':'Chưa lưu bản nháp · Lưu trên trình duyệt này';
    if(position){
      const details=input.closest('[data-position-panel]');
      const title=details.querySelector('.position-title');title.innerHTML=`${escapeHtml(position.name||'Vị trí mới')}<small>${escapeHtml(position.department||'Chưa nhập ban / bộ phận')}</small>`;
      details.querySelector('.position-quota').textContent=position.quota===''?'Chưa nhập chỉ tiêu':`${position.quota} thành viên`;
    }
    input.removeAttribute('aria-invalid');const error=document.getElementById(`${input.id}-error`);if(error){error.hidden=true;error.textContent='';}
  }
  function click(event){
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='preview')ui.openDialog({title:'Xem trước đợt tuyển',body:renderPreview(campaign,{full:true}),actions:'<button type="button" class="button button-primary" data-action="close-dialog">Tiếp tục chỉnh sửa</button>'});
    if(action==='save-draft'){
      store.saveDraft(campaign);campaign=store.getDraft();dirty=false;remember();render({focusId:'campaign-save-draft'});
      ui.toast(store.getMeta().persisted?'Đã lưu bản nháp trên trình duyệt này.':'Bản nháp đang giữ trong tab; trình duyệt chưa lưu được dữ liệu.');
    }
    if(action==='add-position'){
      const openIds=expanded(),id=`position-${globalThis.crypto?.randomUUID?.()||Date.now().toString(36)}`;
      campaign.positions.push({id,department:'',name:'',quota:'',description:'',requirements:''});dirty=true;remember();openIds.add(id);render({openIds,focusId:`position-${id}-name`});
      document.getElementById(`position-${id}-name`).scrollIntoView({block:'center',behavior:'smooth'});
    }
    if(action==='remove-position'){
      const id=event.target.closest('[data-id]').dataset.id,position=campaign.positions.find(p=>p.id===id);if(!position)return;
      if(!canRemovePosition(id,getApplications())){ui.toast('Vị trí đã có hồ sơ ứng tuyển, không thể xóa.');return;}
      ui.openDialog({title:'Xóa vị trí tuyển dụng?',body:`<p>Vị trí <strong>${escapeHtml(position.name||'chưa đặt tên')}</strong> sẽ được bỏ khỏi bản đang chỉnh sửa. Bản công bố chỉ thay đổi khi bạn công bố lại.</p>`,actions:`<button class="button button-secondary" data-action="close-dialog">Giữ lại</button><button class="button button-danger" data-campaign-confirm="${escapeHtml(id)}">Xóa vị trí</button>`});
    }
  }
  function confirmRemove(event){
    const button=event.target.closest('[data-campaign-confirm]');if(!button)return;
    const id=button.dataset.campaignConfirm;if(!canRemovePosition(id,getApplications())){ui.closeDialog();ui.toast('Vị trí đã có hồ sơ, không thể xóa.');return;}
    const openIds=expanded();campaign.positions=campaign.positions.filter(p=>p.id!==id);dirty=true;remember();ui.closeDialog();render({openIds});container.querySelector('[data-action="add-position"]').focus();ui.toast('Đã bỏ vị trí khỏi bản đang chỉnh sửa.');
  }
  function submit(event){
    if(event.target.id!=='campaign-form')return;event.preventDefault();
    const result=store.publish(campaign);
    if(!result.ok){showErrors(result.errors);return;}
    campaign=store.getDraft();dirty=false;remember();render({focusId:'campaign-publish'});
    ui.toast(result.persisted?'Đã công bố đợt tuyển và lưu trên trình duyệt này.':'Đã công bố trong tab này; chưa lưu được trên trình duyệt.');
  }
  function beforeUnload(event){if((dirty||store.getMeta().persisted===false)&&!workingSaved){event.preventDefault();event.returnValue='';}}
  const input=event=>updateLive(event.target);
  const errorLink=event=>{const link=event.target.closest('#campaign-errors a');if(!link)return;event.preventDefault();const target=document.getElementById(link.getAttribute('href').slice(1));target?.closest('details')?.setAttribute('open','');target?.focus();target?.scrollIntoView({block:'center',behavior:'smooth'});};
  render();
  container.addEventListener('input',input);container.addEventListener('change',input);container.addEventListener('click',click);container.addEventListener('click',errorLink);container.addEventListener('submit',submit);
  document.querySelector('#app-dialog').addEventListener('click',confirmRemove);window.addEventListener('beforeunload',beforeUnload);
  return ()=>{container.removeEventListener('input',input);container.removeEventListener('change',input);container.removeEventListener('click',click);container.removeEventListener('click',errorLink);container.removeEventListener('submit',submit);document.querySelector('#app-dialog').removeEventListener('click',confirmRemove);window.removeEventListener('beforeunload',beforeUnload);};
}
