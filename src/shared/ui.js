const paths={
  flow:'<path d="M18 5H10a7 7 0 0 0 0 14h5v-7H8m7 0h6"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',plus:'<path d="M12 5v14M5 12h14"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',alert:'<path d="m12 3 10 18H2zM12 9v4m0 4v.1"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  moon:'<path d="M20.8 13.3A9 9 0 0 1 10.7 3.2 9 9 0 1 0 20.8 13.3Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  leaf:'<path d="M20 3C9 2 2 8 5 16c7 6 16-1 15-13ZM5 20l10-11"/>',
  briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12a20 20 0 0 0 18 0m-9-1v4"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8m-8 4h5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  school:'<path d="m2 9 10-5 10 5-10 5zM6 11v6c4 3 8 3 12 0v-6M22 9v7"/>',
  back:'<path d="M20 12H4m6-6-6 6 6 6"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  logout:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 17v3h16v-3"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20v-1a6 6 0 0 1 12 0v1M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5 5 0 0 1 4 5v1"/>',
  sort:'<path d="M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4"/>',
  trophy:'<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4m8-4h4a3 3 0 0 1-4 4M12 14v4m-4 3h8"/>'
};
/** Download rows as a UTF-8 CSV (with BOM for spreadsheet apps). Values are quoted. */
export function downloadCsv(filename,rows){
  const csv='﻿'+rows.map(r=>r.map(c=>'"'+String(c??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icon=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.info}</svg>`;
export function formatDateTime(value){
  if(!value)return 'Chưa chọn';
  const date=new Date(value);if(Number.isNaN(date.getTime()))return 'Chưa chọn';
  return new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:value.endsWith('Z')?'Asia/Ho_Chi_Minh':undefined}).format(date);
}
export function createUi(){
  const dialog=document.querySelector('#app-dialog'),content=document.querySelector('#dialog-content'),toastNode=document.querySelector('#toast');
  let timer,previousFocus;
  const closeDialog=()=>dialog.close();
  /*
   * Clicking the dimmed backdrop closes informational dialogs. The press must start and end on the
   * backdrop (so selecting text and releasing outside does not close it), and dialogs holding a form
   * stay open so typed input is never lost; those close with Hủy, the X button or Esc.
   */
  let pressedBackdrop=false;
  const pointerdown=event=>{pressedBackdrop=event.target===dialog;};
  const click=event=>{
    if(event.target.closest('[data-action="close-dialog"]')){closeDialog();return;}
    if(event.target===dialog&&pressedBackdrop&&!content.querySelector('form'))closeDialog();
    pressedBackdrop=false;
  };
  const close=()=>{content.innerHTML='<h2 id="dialog-title" class="sr-only">Hộp thoại</h2>';previousFocus?.focus?.({preventScroll:true});};
  dialog.addEventListener('pointerdown',pointerdown);dialog.addEventListener('click',click);dialog.addEventListener('close',close);
  return {
    toast(message){clearTimeout(timer);toastNode.textContent=message;toastNode.classList.add('visible');timer=setTimeout(()=>toastNode.classList.remove('visible'),4500);},
    openDialog({title,body,actions=''}){
      previousFocus=document.activeElement;
      content.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${escapeHtml(title)}</h2><button type="button" class="icon-button" data-action="close-dialog" aria-label="Đóng" title="Đóng (Esc)">${icon('x')}</button></div><div class="dialog-body">${body}</div>${actions?`<div class="dialog-actions">${actions}</div>`:''}`;
      if(!dialog.open)dialog.showModal();
    },closeDialog,
    destroy(){clearTimeout(timer);dialog.removeEventListener('pointerdown',pointerdown);dialog.removeEventListener('click',click);dialog.removeEventListener('close',close);}
  };
}
