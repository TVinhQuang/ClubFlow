import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {renderLayout} from '../src/templates/layout.js';
import {renderCampaign} from '../src/features/campaign/view.js';
import {initialCampaign} from '../src/features/campaign/seed.js';
import {renderApplications} from '../src/features/applications/view.js';
import {initialApplications} from '../src/features/applications/seed.js';
import {renderSchedule} from '../src/features/schedule/view.js';
import {evaluateSchedule,computeStats} from '../src/features/schedule/model.js';
import {initialScheduleConfig,initialApplicantAvailability,initialAssignments} from '../src/features/schedule/seed.js';
import {renderPublic} from '../src/features/public/view.js';
import {renderProfile,renderLogin} from '../src/features/account/view.js';
import {renderApply,renderMine} from '../src/features/applicant/view.js';
import {buildMineItems} from '../src/features/applicant/index.js';
import {renderInterviews} from '../src/features/interviews/view.js';
import {renderResults} from '../src/features/results/view.js';
import {accounts} from '../src/shared/accounts.js';

const executive=['executive'];
export const pages=[
  {file:'index.html',view:'campaign',title:'Tạo đợt tuyển',roles:executive},
  {file:'applications.html',view:'applications',title:'Duyệt hồ sơ',roles:executive},
  {file:'schedule.html',view:'schedule',title:'Xếp lịch phỏng vấn',roles:executive},
  {file:'results.html',view:'results',title:'Kết quả tuyển',roles:executive,area:'management'},
  {file:'interviews.html',view:'interviews',title:'Lịch phỏng vấn của tôi',roles:['interviewer']},
  {file:'apply.html',view:'apply',title:'Nộp đơn ứng tuyển',roles:['applicant']},
  {file:'my-applications.html',view:'mine',title:'Hồ sơ của tôi',roles:['applicant']},
  {file:'discover.html',view:'discover',title:'Khám phá CLB'},
  {file:'recruitment.html',view:'recruitment',title:'Đợt tuyển thành viên'},
  {file:'events.html',view:'events',title:'Lịch trình đợt tuyển'},
  {file:'profile.html',view:'profile',title:'Hồ sơ cá nhân'},
  {file:'login.html',view:'login',title:'Đăng nhập'}
];
const root=fileURLToPath(new URL('../',import.meta.url));

/** Static bodies use the sample data so every page is readable without JavaScript. */
function staticBody(view){
  const shortlisted=initialApplications.filter(a=>a.status==='shortlisted');
  const rows=evaluateSchedule({candidates:shortlisted,config:initialScheduleConfig,availability:initialApplicantAvailability,assignments:initialAssignments});
  const snap={applications:initialApplications,rows,config:initialScheduleConfig,confirmedAt:null};
  const [exec,applicant]=[accounts.find(a=>a.role==='executive'),accounts.find(a=>a.role==='applicant')];
  const interviewer=accounts.find(a=>a.role==='interviewer');
  const base={user:exec,role:exec.role,campaign:initialCampaign,intake:'open',interviewDate:initialScheduleConfig.date,config:initialScheduleConfig,confirmedAt:null,resultsAt:null,now:'2026-11-09T09:00'};
  switch(view){
    case 'campaign':return renderCampaign(initialCampaign);
    case 'applications':return renderApplications(initialApplications,initialCampaign);
    case 'schedule':return renderSchedule({rows,stats:computeStats(rows),campaign:initialCampaign,config:initialScheduleConfig,meta:{}});
    case 'results':return renderResults({confirmed:false,config:initialScheduleConfig,items:[],decisions:{},publishedAt:null,campaign:initialCampaign});
    case 'interviews':return renderInterviews({user:interviewer,confirmed:false,config:initialScheduleConfig,items:[]});
    case 'apply':return renderApply({campaign:initialCampaign,intake:'open',user:applicant,mine:initialApplications.filter(a=>a.studentId===applicant.studentId),config:initialScheduleConfig});
    case 'mine':return renderMine({user:applicant,items:buildMineItems(applicant,snap)});
    case 'login':return renderLogin({user:exec});
    case 'profile':return renderProfile({user:exec,summary:[{label:'Hồ sơ',value:initialApplications.length,context:'Dữ liệu minh họa'},{label:'Lịch phỏng vấn',value:'Bản nháp',context:`${rows.length} buổi cần xếp`}],links:[['grid','index.html','Chuẩn bị đợt tuyển','Thông tin & vị trí'],['file','applications.html','Duyệt hồ sơ','Vòng CV'],['calendar','schedule.html','Xếp lịch phỏng vấn','Lịch & phòng'],['trophy','results.html','Kết quả tuyển','Đạt / Không đạt']]});
    // Static pages are a snapshot: leave out time-relative text (countdowns, "current step") that would go stale.
    default:return renderPublic(view,{...base,now:null});
  }
}

export async function generate(){
  for(const page of pages){
    await writeFile(path.join(root,page.file),renderLayout({...page,body:staticBody(page.view)}).replace(/[\t ]+$/gm,''),'utf8');
  }
  console.log(`Generated ${pages.length} static HTML pages.`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generate();
