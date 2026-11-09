/** Owner: Nguyễn Thái Cường — 24127336. Draft and confirmed interview schedule in localStorage. */
import {initialScheduleConfig,initialAssignments} from './seed.js';
import {normalizeConfig,isTime} from './model.js';

export const SCHEDULE_KEY='clubflow.pa2.schedule.v1';
const copy=value=>structuredClone(value);
const validAssignments=list=>Array.isArray(list)&&list.every(a=>a&&typeof a.applicationId==='string'&&isTime(a.start)&&typeof a.interviewerId==='string'&&typeof a.roomId==='string');
const cleanAssignments=list=>list.map(a=>({applicationId:a.applicationId,start:a.start,interviewerId:a.interviewerId,roomId:a.roomId}));

export function createScheduleStore(storage,{now=()=>new Date().toISOString()}={}){
  let state={schemaVersion:1,config:copy(initialScheduleConfig),assignments:copy(initialAssignments),savedAt:null,confirmedAt:null};
  let warning='',persisted=null;
  try{
    const raw=storage?.getItem(SCHEDULE_KEY);
    if(raw){
      const parsed=JSON.parse(raw);
      if(parsed?.schemaVersion!==1||!parsed.config||typeof parsed.config!=='object'||!validAssignments(parsed.assignments))throw Error('Invalid schedule schema');
      state={schemaVersion:1,config:normalizeConfig(parsed.config),assignments:cleanAssignments(parsed.assignments),savedAt:typeof parsed.savedAt==='string'?parsed.savedAt:null,confirmedAt:typeof parsed.confirmedAt==='string'?parsed.confirmedAt:null};
      persisted=true;
    }
  }catch{warning='Không đọc được lịch đã lưu. Lịch mẫu được mở để bạn tiếp tục; bản lỗi chưa bị ghi đè.';}
  const write=()=>{
    try{if(!storage)throw Error('Storage unavailable');storage.setItem(SCHEDULE_KEY,JSON.stringify(state));persisted=true;warning='';}
    catch{persisted=false;warning='Trình duyệt không lưu được lịch. Thay đổi chỉ giữ trong tab này; hãy bật lưu trữ rồi lưu lại.';}
    return persisted;
  };
  return {
    getConfig:()=>copy(state.config),
    getAssignments:()=>copy(state.assignments),
    getMeta:()=>({savedAt:state.savedAt,confirmedAt:state.confirmedAt,persisted,warning}),
    isConfirmed:()=>Boolean(state.confirmedAt),
    saveDraft({config,assignments}){
      if(state.confirmedAt)return {ok:false,persisted,error:'Lịch đã xác nhận nên chỉ có thể xem.'};
      state.config=normalizeConfig(config);state.assignments=cleanAssignments(assignments);state.savedAt=now();
      return {ok:true,persisted:write()};
    },
    /** Callers must check canConfirm() first; the store only freezes the snapshot. */
    confirm({config,assignments}){
      if(state.confirmedAt)return {ok:false,persisted,error:'Lịch đã được xác nhận trước đó.'};
      state.config=normalizeConfig(config);state.assignments=cleanAssignments(assignments);state.savedAt=state.confirmedAt=now();
      return {ok:true,persisted:write()};
    }
  };
}
