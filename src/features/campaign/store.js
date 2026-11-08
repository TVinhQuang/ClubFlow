import { initialCampaign } from './seed.js';
import { copy,normalizeCampaign,validateCampaign,canRemovePosition } from './model.js';
export const STORAGE_KEY='clubflow.pa2.campaign.v1';
const validShape=c=>c&&typeof c==='object'&&['id','name','club','description','instructions','open','close'].every(key=>typeof c[key]==='string')&&Array.isArray(c.positions)&&c.positions.every(p=>p&&['id','name','department','description','requirements'].every(key=>typeof p[key]==='string')&&(typeof p.quota==='number'||p.quota===''));
export function createCampaignStore(storage,{now=()=>new Date().toISOString(),getApplications=()=>[]}={}){
  let state={schemaVersion:1,draft:copy(initialCampaign),published:null,savedAt:null,publishedAt:null},warning='',persisted=null,persistedSavedAt=null;
  try{
    const raw=storage?.getItem(STORAGE_KEY);
    if(raw){
      const parsed=JSON.parse(raw);
      if(parsed.schemaVersion!==1||!validShape(parsed.draft)||parsed.published!==null&&(!validShape(parsed.published)||validateCampaign(parsed.published).length))throw Error('Invalid campaign schema');
      state={schemaVersion:1,draft:copy(parsed.draft),published:copy(parsed.published),savedAt:typeof parsed.savedAt==='string'?parsed.savedAt:null,publishedAt:typeof parsed.publishedAt==='string'?parsed.publishedAt:null};persisted=true;persistedSavedAt=state.savedAt;
    }
  }catch{warning='Không đọc được bản lưu trước. Dữ liệu mẫu được mở để bạn tiếp tục; bản lỗi chưa bị ghi đè.';}
  const write=()=>{
    try{if(!storage)throw Error('Storage unavailable');storage.setItem(STORAGE_KEY,JSON.stringify(state));persisted=true;persistedSavedAt=state.savedAt;warning='';}
    catch{persisted=false;warning='Trình duyệt không lưu được dữ liệu. Thay đổi hiện chỉ giữ trong tab này; hãy bật lưu trữ rồi lưu lại.';}
    return persisted;
  };
  return {
    getDraft:()=>copy(state.draft),getPublished:()=>copy(state.published),
    getMeta:()=>({savedAt:state.savedAt,persistedSavedAt,publishedAt:state.publishedAt,warning,persisted,hasPublished:!!state.published,hasUnpublishedChanges:!!state.published&&JSON.stringify(state.draft)!==JSON.stringify(state.published)}),
    saveDraft(campaign){state.draft=normalizeCampaign(campaign);state.savedAt=now();return {ok:true,persisted:write()};},
    publish(campaign){
      const next=normalizeCampaign(campaign),errors=validateCampaign(next);
      if(state.published&&next.id!==state.published.id)errors.push({field:'campaign',message:'CLB đã có một đợt tuyển đang hoạt động. Hoàn tất quy trình hiện tại trước khi tạo đợt khác.'});
      const removed=state.published?.positions.filter(p=>!next.positions.some(item=>item.id===p.id))||[];
      if(removed.some(p=>!canRemovePosition(p.id,getApplications())))errors.push({field:'positions',message:'Không thể xóa vị trí đã có hồ sơ ứng tuyển.'});
      if(errors.length)return {ok:false,persisted,errors};
      state.draft=copy(next);state.published=copy(next);state.savedAt=state.publishedAt=now();
      return {ok:true,persisted:write(),errors:[]};
    }
  };
}
