/** Applicant form rules from the brief: PDF CV up to 5 MB, motivation up to 300 words, availability, no duplicates. */
import {isTime,toMinutes,toTime} from '../schedule/model.js';

export const MAX_CV_BYTES=5*1024*1024;
export const MAX_WORDS=300;
export const countWords=text=>String(text||'').trim().split(/\s+/).filter(Boolean).length;

/** Hour-long blocks inside the club's interview window, offered to applicants. */
export function availabilityBlocks(config){
  if(!isTime(config.start)||!isTime(config.end))return [];
  const blocks=[];
  for(let t=toMinutes(config.start);t<toMinutes(config.end);t+=60)blocks.push({from:toTime(t),to:toTime(Math.min(t+60,toMinutes(config.end)))});
  return blocks;
}
/** Merge chosen "HH:MM-HH:MM" blocks into continuous ranges. */
export function mergeBlocks(values){
  const ranges=values.map(v=>v.split('-')).filter(([a,b])=>isTime(a)&&isTime(b)).map(([from,to])=>({from,to})).sort((a,b)=>a.from.localeCompare(b.from));
  const merged=[];
  for(const r of ranges){const last=merged.at(-1);if(last&&last.to>=r.from){if(r.to>last.to)last.to=r.to;}else merged.push({...r});}
  return merged;
}

export function validateApplication(values,{campaign,intake,duplicate}){
  const errors=[],error=(field,message,href)=>errors.push(href?{field,message,href}:{field,message});
  if(intake!=='open')error('form',intake==='closed'?'Đợt tuyển đã đóng nhận đơn.':'Đợt tuyển chưa mở nhận đơn.');
  if(!campaign?.positions?.some(p=>p.id===values.positionId))error('positionId','Chọn vị trí bạn muốn ứng tuyển.');
  else if(duplicate)error('positionId',`Bạn đã nộp hồ sơ ${duplicate.id} cho vị trí này. Mở hồ sơ đã nộp thay vì nộp lại.`,`my-applications.html#app-${duplicate.id}`);
  if(!values.name.trim())error('name','Nhập họ và tên.');else if(values.name.length>120)error('name','Họ và tên tối đa 120 ký tự.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))error('email','Nhập email đúng định dạng, ví dụ ten@example.com.');
  if(!values.major.trim())error('major','Nhập ngành học.');
  if(!values.cv)error('cv','Chọn tệp CV định dạng PDF.');
  else if(!/\.pdf$/i.test(values.cv.name)||(values.cv.type&&values.cv.type!=='application/pdf'))error('cv','CV phải là tệp PDF.');
  else if(values.cv.size>MAX_CV_BYTES)error('cv','CV tối đa 5 MB. Hãy nén hoặc rút gọn tệp.');
  const words=countWords(values.motivation);
  if(!words)error('motivation','Chia sẻ nguyện vọng của bạn.');else if(words>MAX_WORDS)error('motivation',`Nguyện vọng tối đa ${MAX_WORDS} từ (hiện ${words} từ).`);
  if(!values.availability.length)error('availability','Chọn ít nhất một khung giờ bạn có thể phỏng vấn.');
  return errors;
}
