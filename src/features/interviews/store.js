/** One assessment per confirmed interview, written by the assigned interviewer. Browser storage only. */
export const ASSESSMENTS_KEY='clubflow.pa2.assessments.v1';
export const recommendations={pass:'Đề xuất đạt',consider:'Cần cân nhắc',fail:'Không đề xuất'};

export function validateAssessment(input){
  const errors=[];
  if(!Number.isInteger(input.score)||input.score<1||input.score>5)errors.push({field:'score',message:'Chọn điểm đánh giá từ 1 đến 5.'});
  if(!String(input.strengths||'').trim())errors.push({field:'strengths',message:'Ghi lại điểm mạnh của ứng viên.'});
  else if(input.strengths.length>1000)errors.push({field:'strengths',message:'Điểm mạnh tối đa 1000 ký tự.'});
  if(String(input.concerns||'').length>1000)errors.push({field:'concerns',message:'Điểm cần lưu ý tối đa 1000 ký tự.'});
  if(!recommendations[input.recommendation])errors.push({field:'recommendation',message:'Chọn đề xuất cho vị trí này.'});
  return errors;
}

export function createAssessmentsStore(storage,{now=()=>new Date().toISOString()}={}){
  let list=[],warning='';
  try{const parsed=JSON.parse(storage?.getItem(ASSESSMENTS_KEY)||'[]');if(!Array.isArray(parsed))throw Error();list=parsed;}catch{warning='Không đọc được đánh giá đã lưu.';}
  const write=()=>{try{if(!storage)throw Error();storage.setItem(ASSESSMENTS_KEY,JSON.stringify(list));return true;}catch{return false;}};
  return {
    getAll:()=>structuredClone(list),
    get:applicationId=>structuredClone(list.find(a=>a.applicationId===applicationId)||null),
    getWarning:()=>warning,
    submit(input){
      if(list.some(a=>a.applicationId===input.applicationId))return {ok:false,errors:[{field:'form',message:'Buổi phỏng vấn này đã có đánh giá.'}]};
      const entry={applicationId:String(input.applicationId),interviewerId:String(input.interviewerId),score:Number(input.score),strengths:String(input.strengths||'').trim(),concerns:String(input.concerns||'').trim(),recommendation:input.recommendation};
      const errors=validateAssessment(entry);if(errors.length)return {ok:false,errors};
      entry.submittedAt=now();list.push(entry);
      return {ok:true,persisted:write(),assessment:structuredClone(entry)};
    }
  };
}
