/** Final Pass/Fail decisions per application; published once and then read-only. Browser storage only. */
export const RESULTS_KEY='clubflow.pa2.results.v1';
export const decisionLabels={pass:'Đạt',fail:'Không đạt'};

export function createResultsStore(storage,{now=()=>new Date().toISOString()}={}){
  let state={decisions:{},publishedAt:null};
  try{const parsed=JSON.parse(storage?.getItem(RESULTS_KEY)||'null');if(parsed&&typeof parsed.decisions==='object')state={decisions:parsed.decisions,publishedAt:typeof parsed.publishedAt==='string'?parsed.publishedAt:null};}catch{}
  const write=()=>{try{if(!storage)throw Error();storage.setItem(RESULTS_KEY,JSON.stringify(state));return true;}catch{return false;}};
  return {
    getDecisions:()=>({...state.decisions}),
    getPublishedAt:()=>state.publishedAt,
    setDecision(applicationId,decision){
      if(state.publishedAt)return {ok:false,error:'Kết quả đã công bố nên chỉ có thể xem.'};
      if(decision!==null&&!decisionLabels[decision])return {ok:false,error:'Quyết định không hợp lệ.'};
      if(decision===null)delete state.decisions[applicationId];else state.decisions[applicationId]=decision;
      return {ok:true,persisted:write()};
    },
    publish(){
      if(state.publishedAt)return {ok:false,error:'Kết quả đã được công bố.'};
      state.publishedAt=now();return {ok:true,persisted:write()};
    }
  };
}
