/** Owner: Nguyễn Thái Cường — 24127336. Pure scheduling rules for screen 3. */
import {getIntakeStatus,isLocalDateTime} from '../campaign/model.js';
import {interviewerCatalog,roomCatalog} from './seed.js';

export const DURATIONS=[15,20,30];
const TIME=/^([01]\d|2[0-3]):[0-5]\d$/;
export const isTime=value=>typeof value==='string'&&TIME.test(value);
export const toMinutes=value=>{const [h,m]=value.split(':').map(Number);return h*60+m;};
export const toTime=minutes=>`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
export const addMinutes=(time,minutes)=>toTime(toMinutes(time)+minutes);
const covers=(ranges,start,end)=>(ranges||[]).some(r=>isTime(r.from)&&isTime(r.to)&&toMinutes(r.from)<=start&&toMinutes(r.to)>=end);
const overlaps=(a,b,duration)=>toMinutes(a)<toMinutes(b)+duration&&toMinutes(b)<toMinutes(a)+duration;

export const interviewerName=id=>interviewerCatalog.find(i=>i.id===id)?.name||'Người phỏng vấn không còn trong danh sách';
export const roomName=id=>roomCatalog.find(r=>r.id===id)?.name||'Phòng không còn trong danh sách';

export function normalizeConfig(input={}){
  const text=v=>typeof v==='string'?v.trim():'';
  return {
    date:text(input.date),start:text(input.start),end:text(input.end),duration:Number(input.duration),
    interviewers:(Array.isArray(input.interviewers)?input.interviewers:[]).map(i=>({id:text(i.id),positionIds:(Array.isArray(i.positionIds)?i.positionIds:[]).map(text).filter(Boolean),from:text(i.from),to:text(i.to)})),
    roomIds:(Array.isArray(input.roomIds)?input.roomIds:[]).map(text).filter(Boolean)
  };
}

export function validateConfig(input,campaign){
  const c=normalizeConfig(input),errors=[],error=(field,message)=>errors.push({field,message});
  if(!isLocalDateTime(`${c.date}T00:00`))error('date','Chọn ngày phỏng vấn hợp lệ.');
  else if(campaign?.close&&isLocalDateTime(campaign.close)&&c.date<=campaign.close.slice(0,10))error('date','Ngày phỏng vấn phải sau ngày đóng đơn.');
  if(!isTime(c.start))error('start','Chọn giờ bắt đầu hợp lệ.');
  if(!isTime(c.end))error('end','Chọn giờ kết thúc hợp lệ.');
  else if(isTime(c.start)&&toMinutes(c.end)<=toMinutes(c.start))error('end','Giờ kết thúc phải sau giờ bắt đầu.');
  if(!DURATIONS.includes(c.duration))error('duration','Thời lượng mỗi buổi phải là 15, 20 hoặc 30 phút.');
  else if(isTime(c.start)&&isTime(c.end)&&toMinutes(c.end)-toMinutes(c.start)<c.duration)error('end','Khung giờ ngắn hơn một buổi phỏng vấn.');
  if(!c.interviewers.some(i=>i.positionIds.length))error('interviewers','Phân công ít nhất một người phỏng vấn cho một vị trí.');
  for(const i of c.interviewers){
    if(!isTime(i.from)||!isTime(i.to)||toMinutes(i.to)<=toMinutes(i.from))error(`interviewer.${i.id}`,`Giờ rảnh của ${interviewerName(i.id)} chưa hợp lệ.`);
  }
  if(!c.roomIds.length)error('rooms','Chọn ít nhất một phòng phỏng vấn.');
  return errors;
}

export function generateSlots(input){
  const c=normalizeConfig(input);
  if(!isTime(c.start)||!isTime(c.end)||!DURATIONS.includes(c.duration))return [];
  const slots=[];
  for(let t=toMinutes(c.start);t+c.duration<=toMinutes(c.end);t+=c.duration)slots.push({start:toTime(t),end:toTime(t+c.duration)});
  return slots;
}

const applicantRanges=(candidate,availability)=>Array.isArray(candidate.availability)?candidate.availability:availability?.[candidate.id]||[];
const order=(a,b)=>String(a.submitted||'').localeCompare(String(b.submitted||''))||a.id.localeCompare(b.id);

/** Issues for one assignment, given every other assignment in the draft. */
function assignmentIssues(assignment,candidate,{config,candidates,availability,assignments}){
  const issues=[],slots=generateSlots(config),start=toMinutes(assignment.start),end=start+config.duration;
  const interviewer=config.interviewers.find(i=>i.id===assignment.interviewerId);
  if(!slots.some(s=>s.start===assignment.start))issues.push({type:'time',message:'Giờ đã chọn nằm ngoài các khung phỏng vấn.'});
  if(!interviewer)issues.push({type:'interviewer-missing',message:'Người phỏng vấn không còn trong cấu hình.'});
  else{
    if(!interviewer.positionIds.includes(candidate.positionId))issues.push({type:'qualification',message:`${interviewerName(interviewer.id)} không phụ trách vị trí ${candidate.role}.`});
    if(!covers([{from:interviewer.from,to:interviewer.to}],start,end))issues.push({type:'interviewer-availability',message:`Ngoài giờ rảnh của ${interviewerName(interviewer.id)}.`});
  }
  if(!config.roomIds.includes(assignment.roomId))issues.push({type:'room-missing',message:'Phòng không có trong danh sách đã chọn.'});
  if(!covers(applicantRanges(candidate,availability),start,end))issues.push({type:'applicant-availability',message:'Ngoài khung giờ rảnh ứng viên đã chọn.'});
  for(const other of assignments){
    if(other.applicationId===assignment.applicationId||!overlaps(other.start,assignment.start,config.duration))continue;
    const otherCandidate=candidates.find(c=>c.id===other.applicationId);if(!otherCandidate)continue;
    const time=`${other.start}–${addMinutes(other.start,config.duration)}`;
    if(other.interviewerId===assignment.interviewerId)issues.push({type:'interviewer',with:other.applicationId,message:`Trùng người phỏng vấn ${interviewerName(other.interviewerId)} với ${other.applicationId} (${time}).`});
    if(other.roomId===assignment.roomId)issues.push({type:'room',with:other.applicationId,message:`Trùng ${roomName(other.roomId)} với ${other.applicationId} (${time}).`});
    if(otherCandidate.studentId===candidate.studentId)issues.push({type:'applicant',with:other.applicationId,message:`Ứng viên đã có buổi phỏng vấn ${other.applicationId} (${time}).`});
  }
  return issues;
}

/** Why an application cannot be placed, checked in the same order the Executive would fix it. */
export function unassignedReason(candidate,{config,availability}){
  const qualified=config.interviewers.filter(i=>i.positionIds.includes(candidate.positionId));
  if(!qualified.length)return `Chưa có người phỏng vấn phụ trách vị trí ${candidate.role}.`;
  const ranges=applicantRanges(candidate,availability);
  if(!ranges.length)return 'Ứng viên chưa chọn khung giờ rảnh.';
  const shared=generateSlots(config).some(s=>{const a=toMinutes(s.start),b=toMinutes(s.end);return covers(ranges,a,b)&&qualified.some(i=>covers([{from:i.from,to:i.to}],a,b));});
  if(!shared)return 'Không có khung giờ chung giữa ứng viên và người phỏng vấn phụ trách.';
  if(!config.roomIds.length)return 'Chưa chọn phòng phỏng vấn.';
  return 'Các khung giờ chung đã kín người phỏng vấn, phòng hoặc trùng buổi khác của ứng viên.';
}

/** Sequentially gives each application the first free slot × interviewer × room. */
export function generateDraft({candidates,config:input,availability}){
  const config=normalizeConfig(input),assignments=[],reasons={},slots=generateSlots(config);
  for(const candidate of [...candidates].sort(order)){
    const ranges=applicantRanges(candidate,availability);let placed=null;
    for(const slot of slots){
      const a=toMinutes(slot.start),b=toMinutes(slot.end);
      if(!covers(ranges,a,b))continue;
      const busy=assignments.filter(x=>overlaps(x.start,slot.start,config.duration));
      if(busy.some(x=>candidates.find(c=>c.id===x.applicationId)?.studentId===candidate.studentId))continue;
      const interviewer=config.interviewers.find(i=>i.positionIds.includes(candidate.positionId)&&covers([{from:i.from,to:i.to}],a,b)&&!busy.some(x=>x.interviewerId===i.id));
      const roomId=config.roomIds.find(id=>!busy.some(x=>x.roomId===id));
      if(interviewer&&roomId){placed={applicationId:candidate.id,start:slot.start,interviewerId:interviewer.id,roomId};break;}
    }
    if(placed)assignments.push(placed);else reasons[candidate.id]=unassignedReason(candidate,{config,availability});
  }
  return {assignments,reasons};
}

/** Every shortlisted application becomes exactly one row; status is derived, never stored. */
export function evaluateSchedule({candidates,config:input,availability,assignments=[],confirmedAt=null}){
  const config=normalizeConfig(input),ids=new Set(candidates.map(c=>c.id));
  const active=assignments.filter(a=>ids.has(a.applicationId));
  const rows=candidates.map(candidate=>{
    const assignment=active.find(a=>a.applicationId===candidate.id)||null;
    if(!assignment)return {candidate,assignment:null,status:'unassigned',reason:unassignedReason(candidate,{config,availability}),issues:[]};
    const issues=assignmentIssues(assignment,candidate,{config,candidates,availability,assignments:active});
    return {candidate,assignment,end:addMinutes(assignment.start,config.duration),status:issues.length?'conflict':confirmedAt?'confirmed':'proposed',reason:'',issues};
  });
  return rows.sort((a,b)=>(a.assignment?0:1)-(b.assignment?0:1)||String(a.assignment?.start||'').localeCompare(String(b.assignment?.start||''))||order(a.candidate,b.candidate));
}

export function computeStats(rows){
  const count=status=>rows.filter(r=>r.status===status).length;
  return {total:rows.length,proposed:count('proposed'),conflict:count('conflict'),unassigned:count('unassigned'),confirmed:count('confirmed')};
}

export function localNow(){
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()).replace(' ','T');
}

/** All conditions from the brief: closed intake, all reviewed, every row valid. */
export function canConfirm({rows,campaign,applications=[],config,now=localNow(),confirmedAt=null}){
  const blockers=[],add=(type,message,ids=[])=>blockers.push({type,message,ids});
  if(confirmedAt)add('confirmed','Lịch đã được xác nhận trước đó.');
  if(!campaign)add('campaign','Đợt tuyển chưa được công bố.');
  else if(getIntakeStatus(campaign,{published:true,now})!=='closed')add('deadline',`Đợt tuyển còn nhận đơn đến ${campaign.close.replace('T',' ')}; chỉ xác nhận lịch sau khi đóng đơn.`);
  const pending=applications.filter(a=>a.status==='pending');
  if(pending.length)add('pending',`Còn ${pending.length} hồ sơ chờ duyệt ở bước 2.`,pending.map(a=>a.id));
  if(config&&validateConfig(config,campaign).length)add('config','Cấu hình phỏng vấn còn thông tin chưa hợp lệ.');
  if(!rows.length)add('empty','Chưa có hồ sơ qua vòng CV để xếp lịch.');
  const unassigned=rows.filter(r=>r.status==='unassigned');
  if(unassigned.length)add('unassigned',`${unassigned.length} hồ sơ chưa có lịch.`,unassigned.map(r=>r.candidate.id));
  const conflict=rows.filter(r=>r.status==='conflict');
  if(conflict.length)add('conflict',`${conflict.length} lịch đang xung đột.`,conflict.map(r=>r.candidate.id));
  return {ok:!blockers.length,blockers};
}
