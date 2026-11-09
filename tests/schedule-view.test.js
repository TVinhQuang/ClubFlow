import test from 'node:test';
import assert from 'node:assert/strict';
import {renderSchedule,renderEditor,renderConfirmSummary,scheduleCsvRows} from '../src/features/schedule/view.js';
import {evaluateSchedule,computeStats,canConfirm} from '../src/features/schedule/model.js';
import {initialScheduleConfig,initialApplicantAvailability,initialAssignments} from '../src/features/schedule/seed.js';
import {initialApplications} from '../src/features/applications/seed.js';
import {initialCampaign} from '../src/features/campaign/seed.js';

const build=(candidates=initialApplications.filter(a=>a.status==='shortlisted'),meta={})=>{
  const rows=evaluateSchedule({candidates,config:initialScheduleConfig,availability:initialApplicantAvailability,assignments:initialAssignments,confirmedAt:meta.confirmedAt});
  return {rows,html:renderSchedule({rows,stats:computeStats(rows),campaign:initialCampaign,config:initialScheduleConfig,meta})};
};

test('schedule page has one h1, unique IDs, labelled controls and links between steps',()=>{
  const {html,rows}=build();
  assert.equal([...html.matchAll(/<h1\b/g)].length,1);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const m of html.matchAll(/<label[^>]+for="([^"]+)"/g))assert.ok(ids.includes(m[1]),m[1]);
  assert.ok(html.includes('href="applications.html"'));
  assert.equal([...html.matchAll(/<tr id="schedule-row-/g)].length,rows.length);
  for(const label of ['Gán lịch','Giải quyết','Sửa'])assert.ok(html.includes(label),label);
});

test('the totals line and caption match the rows',()=>{
  const {html,rows}=build(),s=computeStats(rows);
  assert.ok(html.includes(`Tổng ${s.total} = ${s.proposed} đề xuất + ${s.conflict} xung đột + ${s.unassigned} chưa xếp + ${s.confirmed} đã xác nhận`));
});

test('applicant names are escaped and confirmed schedules render read-only',()=>{
  const evil=initialApplications.filter(a=>a.status==='shortlisted').map(a=>a.id==='HS-002'?{...a,name:'<img src=x onerror=alert(1)>'}:a);
  assert.ok(!build(evil).html.includes('<img src=x'));
  const {html}=build(undefined,{confirmedAt:'2026-11-21T02:00:00Z'});
  assert.ok(html.includes('fieldset class="schedule-fieldset" disabled'));
  assert.ok(!html.includes('id="schedule-confirm"'));
  assert.ok(html.includes('href="results.html"'));
});

test('editor offers only qualified interviewers and the summary lists blockers',()=>{
  const {rows}=build();
  const row=rows.find(r=>r.candidate.id==='HS-005');
  const html=renderEditor(row,{config:initialScheduleConfig,check:row.issues});
  assert.ok(html.includes('Đặng Hoài Nam'));
  assert.ok(!html.includes('Võ Khánh Linh'));
  const result=canConfirm({rows,campaign:initialCampaign,applications:initialApplications,config:initialScheduleConfig,now:'2026-11-09T10:00'});
  const summary=renderConfirmSummary(computeStats(rows),result.blockers,initialScheduleConfig);
  assert.ok(summary.includes('Chưa thể xác nhận'));
  assert.equal(scheduleCsvRows(rows).length,rows.length+1);
});
