import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSlots,validateConfig,generateDraft,evaluateSchedule,computeStats,canConfirm,toMinutes} from '../src/features/schedule/model.js';
import {initialScheduleConfig,initialApplicantAvailability,initialAssignments} from '../src/features/schedule/seed.js';
import {initialApplications} from '../src/features/applications/seed.js';
import {initialCampaign} from '../src/features/campaign/seed.js';

const shortlisted=initialApplications.filter(a=>a.status==='shortlisted');
const base={candidates:shortlisted,config:initialScheduleConfig,availability:initialApplicantAvailability};

test('slots follow the 15/20/30 minute duration inside the window',()=>{
  for(const duration of [15,20,30]){
    const slots=generateSlots({...initialScheduleConfig,duration});
    assert.equal(slots[0].start,'08:00');
    assert.equal(slots.length,(toMinutes('11:00')-toMinutes('08:00'))/duration);
    assert.ok(toMinutes(slots.at(-1).end)<=toMinutes('11:00'));
  }
});

test('config validation rejects other durations, inverted windows and dates before the deadline',()=>{
  assert.deepEqual(validateConfig(initialScheduleConfig,initialCampaign),[]);
  const fields=c=>validateConfig(c,initialCampaign).map(e=>e.field);
  assert.ok(fields({...initialScheduleConfig,duration:25}).includes('duration'));
  assert.ok(fields({...initialScheduleConfig,start:'11:00',end:'08:00'}).includes('end'));
  assert.ok(fields({...initialScheduleConfig,date:'2026-11-15'}).includes('date'));
  assert.ok(fields({...initialScheduleConfig,roomIds:[]}).includes('rooms'));
});

test('seed draft shows a real overlap and a reasoned unassigned application',()=>{
  const rows=evaluateSchedule({...base,assignments:initialAssignments});
  const byId=Object.fromEntries(rows.map(r=>[r.candidate.id,r]));
  assert.equal(byId['HS-005'].status,'conflict');
  assert.equal(byId['HS-002'].status,'conflict','both overlapping rows are affected');
  assert.ok(byId['HS-005'].issues.some(i=>i.with==='HS-002'&&i.type==='interviewer'));
  assert.ok(byId['HS-005'].issues.some(i=>i.type==='room'));
  assert.equal(byId['HS-003'].status,'proposed');
  assert.equal(byId['HS-008'].status,'unassigned');
  assert.match(byId['HS-008'].reason,/khung giờ chung/);
});

test('the same student cannot have two overlapping interviews',()=>{
  const rows=evaluateSchedule({candidates:shortlisted,config:{...initialScheduleConfig,interviewers:initialScheduleConfig.interviewers.map(i=>({...i,from:'08:00',to:'11:00'}))},availability:{...initialApplicantAvailability,'HS-008':[{from:'08:00',to:'11:00'}]},assignments:[
    {applicationId:'HS-002',start:'09:00',interviewerId:'iv-nam',roomId:'room-i23'},
    {applicationId:'HS-008',start:'09:00',interviewerId:'iv-tram',roomId:'room-i24'}
  ]});
  const row=rows.find(r=>r.candidate.id==='HS-008');
  assert.equal(row.status,'conflict');
  assert.ok(row.issues.some(i=>i.type==='applicant'&&i.with==='HS-002'));
});

test('draft generation picks the first free combination and never creates conflicts',()=>{
  const {assignments,reasons}=generateDraft(base);
  const rows=evaluateSchedule({...base,assignments});
  assert.equal(rows.filter(r=>r.status==='conflict').length,0);
  const first=assignments.find(a=>a.applicationId==='HS-002');
  assert.deepEqual(first,{applicationId:'HS-002',start:'08:00',interviewerId:'iv-nam',roomId:'room-i23'});
  assert.ok(reasons['HS-008']);
  const noInterviewer=generateDraft({...base,config:{...initialScheduleConfig,interviewers:initialScheduleConfig.interviewers.filter(i=>i.id!=='iv-tram')}});
  assert.match(noInterviewer.reasons['HS-008'],/người phỏng vấn phụ trách/);
});

test('statistics are counted from the same rows as the table',()=>{
  const rows=evaluateSchedule({...base,assignments:initialAssignments});
  const stats=computeStats(rows);
  assert.equal(stats.total,rows.length);
  assert.equal(stats.proposed+stats.conflict+stats.unassigned+stats.confirmed,stats.total);
});

test('confirmation is blocked before the deadline, with pending reviews, unassigned or conflicting rows',()=>{
  const rows=evaluateSchedule({...base,assignments:initialAssignments});
  const result=canConfirm({rows,campaign:initialCampaign,applications:initialApplications,config:initialScheduleConfig,now:'2026-11-09T10:00'});
  assert.equal(result.ok,false);
  const kinds=result.blockers.map(b=>b.type);
  for(const kind of ['deadline','pending','unassigned','conflict'])assert.ok(kinds.includes(kind),kind);
});

test('confirmation is allowed once every requirement is met',()=>{
  const config={...initialScheduleConfig,interviewers:initialScheduleConfig.interviewers.map(i=>({...i,from:'08:00',to:'11:00'}))};
  const availability={...initialApplicantAvailability,'HS-008':[{from:'08:00',to:'11:00'}]};
  const {assignments}=generateDraft({candidates:shortlisted,config,availability});
  const rows=evaluateSchedule({candidates:shortlisted,config,availability,assignments});
  const reviewed=initialApplications.map(a=>a.status==='pending'?{...a,status:'rejected'}:a);
  const result=canConfirm({rows,campaign:initialCampaign,applications:reviewed,config,now:'2026-11-21T09:00'});
  assert.deepEqual(result.blockers,[]);
  assert.equal(result.ok,true);
  const confirmed=evaluateSchedule({candidates:shortlisted,config,availability,assignments,confirmedAt:'2026-11-21T09:00'});
  assert.ok(confirmed.every(r=>r.status==='confirmed'));
});
