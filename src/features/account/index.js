/** Account controller: profile.html summary per role and login.html sample-account switch. */
import {getIntakeStatus} from '../campaign/model.js';
import {scheduleSnapshot} from '../schedule/snapshot.js';
import {roleHome} from '../../shared/accounts.js';
import {renderProfile,renderLogin} from './view.js';

export function profileData(user,services,snap,campaign){
  if(user.role==='executive'){
    const apps=snap.applications,count=s=>apps.filter(a=>a.status===s).length;
    return {summary:[
      {label:'Đợt tuyển',value:campaign?({open:'Đang nhận đơn',upcoming:'Sắp mở',closed:'Đã đóng',draft:'Bản nháp'})[getIntakeStatus(campaign,{published:true})]:'Chưa công bố',context:campaign?.name||'Chuẩn bị ở bước 1'},
      {label:'Hồ sơ',value:apps.length,context:`${count('pending')} chờ duyệt · ${count('shortlisted')} qua vòng CV`},
      {label:'Lịch phỏng vấn',value:snap.confirmedAt?'Đã xác nhận':'Bản nháp',context:`${snap.rows.length} buổi cần xếp`},
      {label:'Kết quả',value:services.resultsStore.getPublishedAt()?'Đã công bố':'Chưa công bố',context:'Bước sau phỏng vấn'}
    ],links:[['grid','index.html','Chuẩn bị đợt tuyển','Thông tin & vị trí'],['file','applications.html','Duyệt hồ sơ','Vòng CV'],['calendar','schedule.html','Xếp lịch phỏng vấn','Lịch & phòng'],['trophy','results.html','Kết quả tuyển','Đạt / Không đạt']]};
  }
  if(user.role==='applicant'){
    const mine=snap.applications.filter(a=>a.studentId===user.studentId);
    return {summary:[
      {label:'Hồ sơ đã nộp',value:mine.length,context:mine.map(a=>a.role).join(', ')||'Chưa có hồ sơ'},
      {label:'Qua vòng CV',value:mine.filter(a=>a.status==='shortlisted').length,context:'Trong các hồ sơ của bạn'},
      {label:'Lịch phỏng vấn',value:snap.confirmedAt?snap.rows.filter(r=>r.assignment&&r.candidate.studentId===user.studentId).length:'Chờ',context:snap.confirmedAt?'buổi đã xác nhận':'Lịch chưa được xác nhận'}
    ],links:[['file','my-applications.html','Hồ sơ ứng tuyển của tôi','Trạng thái, lịch và kết quả'],['upload','apply.html','Nộp đơn ứng tuyển','Mỗi vị trí một hồ sơ']]};
  }
  const setting=snap.config.interviewers.find(i=>i.id===user.id);
  const positions=(campaign?.positions||[]).filter(p=>setting?.positionIds.includes(p.id)).map(p=>p.name);
  return {summary:[
    {label:'Vị trí phụ trách',value:positions.length,context:positions.join(', ')||'Chưa được phân công'},
    {label:'Giờ rảnh đã đăng ký',value:setting?`${setting.from}–${setting.to}`:'—',context:`Ngày ${snap.config.date.split('-').reverse().join('/')}`},
    {label:'Buổi được giao',value:snap.confirmedAt?snap.rows.filter(r=>r.assignment?.interviewerId===user.id).length:'Chờ',context:snap.confirmedAt?'trong lịch đã xác nhận':'Lịch chưa được xác nhận'}
  ],links:[['calendar','interviews.html','Lịch phỏng vấn của tôi','Hồ sơ và đánh giá']]};
}

export function mount(container,services){
  const user=services.session.getUser();
  if(document.body.dataset.view==='login'){
    container.innerHTML=renderLogin({user});
    const click=event=>{
      const button=event.target.closest('[data-sign-in]');if(!button)return;
      if(services.session.signIn(button.dataset.signIn))window.location.href=roleHome[services.session.getUser().role];
    };
    container.addEventListener('click',click);
    return ()=>container.removeEventListener('click',click);
  }
  container.innerHTML=renderProfile({user,...profileData(user,services,scheduleSnapshot(services),services.campaignStore.getPublished())});
  return ()=>{};
}
