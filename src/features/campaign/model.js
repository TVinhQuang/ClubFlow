const text=value=>typeof value==='string'?value.trim():'';
export const copy=value=>structuredClone(value);
export function normalizeCampaign(input={}){
  return {
    id:text(input.id),name:text(input.name),club:text(input.club),description:text(input.description),instructions:text(input.instructions),open:text(input.open),close:text(input.close),
    positions:(Array.isArray(input.positions)?input.positions:[]).map(p=>({id:text(p.id),name:text(p.name),department:text(p.department),quota:p.quota===''?'':Number(p.quota),description:text(p.description),requirements:text(p.requirements)}))
  };
}
export function isLocalDateTime(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return false;
  const [year,month,day,hour,minute]=value.split(/[-T:]/).map(Number);
  const date=new Date(Date.UTC(year,month-1,day,hour,minute));
  return year>=2000&&year<=2100&&date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day&&hour<24&&minute<60;
}
export function validateCampaign(input){
  const c=normalizeCampaign(input),errors=[];
  const error=(field,message)=>errors.push({field,message});
  for(const [key,label,max] of [['name','Tên đợt tuyển',120],['club','Câu lạc bộ tổ chức',120],['description','Giới thiệu đợt tuyển',1200],['instructions','Hướng dẫn ứng tuyển',2000]]){
    if(!c[key])error(key,`${label} không được để trống.`);else if(c[key].length>max)error(key,`${label} tối đa ${max} ký tự.`);
  }
  if(!/^[a-zA-Z0-9-]+$/.test(c.id))error('campaign','Mã đợt tuyển không hợp lệ.');
  if(!isLocalDateTime(c.open))error('open','Chọn ngày và giờ mở đơn hợp lệ.');
  if(!isLocalDateTime(c.close))error('close','Chọn ngày và giờ đóng đơn hợp lệ.');
  if(isLocalDateTime(c.open)&&isLocalDateTime(c.close)&&c.close<=c.open)error('close','Thời gian đóng đơn phải sau thời gian mở đơn.');
  if(!c.positions.length)error('positions','Thêm ít nhất một vị trí trước khi công bố.');
  const ids=new Set(),names=new Set();
  for(const p of c.positions){
    if(!/^[a-zA-Z0-9-]+$/.test(p.id)||ids.has(p.id))error('positions','Mỗi vị trí phải có mã riêng hợp lệ.');ids.add(p.id);
    for(const [key,label,max] of [['department','Ban / bộ phận',120],['name','Tên vị trí',120],['description','Mô tả công việc',2000],['requirements','Yêu cầu và kỹ năng',2000]]){
      if(!p[key])error(`positions.${p.id}.${key}`,`${label} không được để trống.`);else if(p[key].length>max)error(`positions.${p.id}.${key}`,`${label} tối đa ${max} ký tự.`);
    }
    if(!Number.isSafeInteger(p.quota)||p.quota<=0)error(`positions.${p.id}.quota`,'Chỉ tiêu phải là số nguyên lớn hơn 0.');
    const key=`${p.department.toLocaleLowerCase('vi-VN')}|${p.name.toLocaleLowerCase('vi-VN')}`;
    if(p.department&&p.name&&names.has(key))error(`positions.${p.id}.name`,'Tên vị trí này đã có trong cùng ban.');names.add(key);
  }
  return errors;
}
export function canRemovePosition(positionId,applications=[]){return !applications.some(a=>a.positionId===positionId);}
export function getIntakeStatus(campaign,{published=false,now}={}){
  if(!published)return 'draft';
  if(!isLocalDateTime(campaign.open)||!isLocalDateTime(campaign.close))return 'draft';
  const localNow=now||new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()).replace(' ','T');
  return localNow<campaign.open?'upcoming':localNow>=campaign.close?'closed':'open';
}
