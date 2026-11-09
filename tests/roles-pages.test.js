import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession} from '../src/shared/session.js';
import {createNotifications} from '../src/shared/notifications.js';
import {createApplicationsStore} from '../src/features/applications/store.js';
import {paginate,renderApplications,PAGE_SIZE} from '../src/features/applications/view.js';
import {validateApplication,countWords,mergeBlocks,availabilityBlocks} from '../src/features/applicant/model.js';
import {renderMine,renderApply} from '../src/features/applicant/view.js';
import {buildMineItems} from '../src/features/applicant/index.js';
import {createAssessmentsStore} from '../src/features/interviews/store.js';
import {createResultsStore} from '../src/features/results/store.js';
import {publishBlockers,quotaSummary} from '../src/features/results/view.js';
import {buildInterviewItems} from '../src/features/interviews/index.js';
import {timelineItems} from '../src/features/public/view.js';
import {renderLogin} from '../src/features/account/view.js';
import {evaluateSchedule} from '../src/features/schedule/model.js';
import {initialScheduleConfig,initialApplicantAvailability,initialAssignments} from '../src/features/schedule/seed.js';
import {initialApplications} from '../src/features/applications/seed.js';
import {initialCampaign} from '../src/features/campaign/seed.js';
import {accounts} from '../src/shared/accounts.js';

const memory=()=>{const map=new Map();return {getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v))};};
const huy=accounts.find(a=>a.id==='app-huy'),nam=accounts.find(a=>a.id==='iv-nam');
const shortlisted=initialApplications.filter(a=>a.status==='shortlisted');
const confirmedRows=evaluateSchedule({candidates:shortlisted,config:initialScheduleConfig,availability:initialApplicantAvailability,assignments:initialAssignments,confirmedAt:'x'});

test('session defaults to the Executive, remembers a choice and signs out to a visitor',()=>{
  const storage=memory();
  assert.equal(createSession(storage).getUser().role,'executive');
  createSession(storage).signIn('app-huy');
  assert.equal(createSession(storage).getUser().id,'app-huy');
  createSession(storage).signOut();
  assert.equal(createSession(storage).getUser().role,'visitor');
  assert.equal(createSession(storage).signIn('nobody'),false);
});

test('notifications are per user and can be marked read',()=>{
  const n=createNotifications(memory());
  n.add([{userId:'app-huy',message:'A'},{userId:'iv-nam',message:'B'}]);
  assert.equal(n.unread('app-huy'),1);
  n.markAllRead('app-huy');
  assert.equal(n.unread('app-huy'),0);
  assert.equal(n.unread('iv-nam'),1);
});

test('applications sort and paginate; duplicates for the same position are refused',()=>{
  const info=paginate(initialApplications,{sort:'submitted-asc',page:2});
  assert.equal(info.rows.length,initialApplications.length-PAGE_SIZE);
  assert.equal(info.from,PAGE_SIZE+1);
  const html=renderApplications(initialApplications,initialCampaign,{sort:'name-asc'});
  assert.ok(html.includes('aria-sort="ascending"'));
  assert.ok(html.includes('Thời gian nộp'));
  const store=createApplicationsStore(memory());
  assert.equal(store.create({studentId:'24120102',positionId:'position-events'}).ok,false);
  const created=store.create({studentId:'25120419',positionId:'position-photo',submitted:'2026-11-09T10:00'});
  assert.equal(created.application.id,'HS-010');
  assert.equal(created.application.status,'pending');
});

test('application form enforces PDF ≤ 5 MB, 300 words, availability and open intake',()=>{
  const ok={positionId:'position-photo',name:'A',email:'a@example.com',major:'CNTT',motivation:'Xin chào',availability:['08:00-09:00'],cv:{name:'cv.pdf',size:1000,type:'application/pdf'}};
  assert.deepEqual(validateApplication(ok,{campaign:initialCampaign,intake:'open'}),[]);
  const fields=(v,o={})=>validateApplication({...ok,...v},{campaign:initialCampaign,intake:'open',...o}).map(e=>e.field);
  assert.ok(fields({cv:{name:'cv.docx',size:10,type:''}}).includes('cv'));
  assert.ok(fields({cv:{name:'cv.pdf',size:6*1024*1024,type:'application/pdf'}}).includes('cv'));
  assert.ok(fields({motivation:'từ '.repeat(301)}).includes('motivation'));
  assert.ok(fields({availability:[]}).includes('availability'));
  assert.ok(fields({},{intake:'closed'}).includes('form'));
  const dup=validateApplication(ok,{campaign:initialCampaign,intake:'open',duplicate:{id:'HS-005'}});
  assert.equal(dup[0].href,'my-applications.html#app-HS-005');
  assert.equal(countWords('  một  hai ba '),3);
  assert.deepEqual(mergeBlocks(['09:00-10:00','08:00-09:00','10:00-11:00']),[{from:'08:00',to:'11:00'}]);
  assert.equal(availabilityBlocks(initialScheduleConfig).length,3);
});

test('applicants see their own applications without internal notes; interviews only once confirmed',()=>{
  const snap={applications:initialApplications,rows:confirmedRows,config:initialScheduleConfig,confirmedAt:null};
  const pending=buildMineItems(huy,snap);
  assert.equal(pending.length,2);
  assert.ok(pending.every(i=>i.interview===null));
  const confirmed=buildMineItems(huy,{...snap,confirmedAt:'2026-11-21T02:00:00Z'},{decisions:{'HS-002':'pass'},publishedAt:'2026-11-24T02:00:00Z'});
  const html=renderMine({user:huy,items:confirmed});
  for(const a of initialApplications.filter(a=>a.studentId===huy.studentId))assert.ok(!html.includes(a.note),'internal note must not be shown');
  assert.ok(html.includes('Chúc mừng'));
  assert.equal([...renderApply({campaign:initialCampaign,intake:'open',user:huy,mine:[],config:initialScheduleConfig}).matchAll(/<h1\b/g)].length,1);
});

test('interviewers only get their own interviews and assess after the start time, once',()=>{
  const items=buildInterviewItems(nam,{rows:confirmedRows,config:initialScheduleConfig,confirmedAt:'x'},[],'2026-11-23T08:10');
  assert.ok(items.every(i=>i.row.assignment.interviewerId==='iv-nam'));
  assert.equal(items.find(i=>i.row.candidate.id==='HS-002').canAssess,true);
  assert.equal(buildInterviewItems(nam,{rows:confirmedRows,config:initialScheduleConfig,confirmedAt:null},[]).length,0);
  const store=createAssessmentsStore(memory());
  assert.equal(store.submit({applicationId:'HS-002',interviewerId:'iv-nam',score:0,strengths:'',recommendation:'x'}).ok,false);
  assert.equal(store.submit({applicationId:'HS-002',interviewerId:'iv-nam',score:4,strengths:'Tốt',concerns:'',recommendation:'pass'}).ok,true);
  assert.equal(store.submit({applicationId:'HS-002',interviewerId:'iv-nam',score:5,strengths:'Lại',concerns:'',recommendation:'pass'}).ok,false);
});

test('results need assessments and decisions within quota, then become read-only',()=>{
  const items=confirmedRows.filter(r=>r.assignment).map(row=>({row,assessment:{score:4,recommendation:'pass'}}));
  const decisions=Object.fromEntries(items.map(i=>[i.row.candidate.id,'pass']));
  assert.deepEqual(publishBlockers(items,decisions,quotaSummary(initialCampaign,items,decisions)),[]);
  assert.ok(publishBlockers(items,{},quotaSummary(initialCampaign,items,{})).length>0);
  const tightCampaign={...initialCampaign,positions:initialCampaign.positions.map(p=>({...p,quota:0}))};
  assert.ok(publishBlockers(items,decisions,quotaSummary(tightCampaign,items,decisions)).some(b=>b.includes('vượt chỉ tiêu')));
  const store=createResultsStore(memory());
  assert.equal(store.setDecision('HS-002','pass').ok,true);
  assert.equal(store.publish().ok,true);
  assert.equal(store.setDecision('HS-002','fail').ok,false);
});

test('timeline follows the shared dates and the sign-in page lists every role',()=>{
  const items=timelineItems({campaign:initialCampaign,config:initialScheduleConfig,confirmedAt:null,resultsAt:null,now:'2026-11-09T09:00'});
  assert.equal(items[0].state,'done');
  assert.equal(items[1].state,'current');
  assert.equal(items[3].state,'upcoming');
  const html=renderLogin({user:accounts[0]});
  for(const a of accounts)assert.ok(html.includes(`data-sign-in="${a.id}"`));
  assert.equal([...html.matchAll(/<h1\b/g)].length,1);
});
