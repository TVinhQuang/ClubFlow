import test from 'node:test';
import assert from 'node:assert/strict';
import {renderDiscover,renderRecruitment,renderEvents,intakeProgress} from '../src/features/public/view.js';
import {initialCampaign} from '../src/features/campaign/seed.js';
import {initialScheduleConfig} from '../src/features/schedule/seed.js';

const base=role=>({role,campaign:initialCampaign,intake:'open',config:initialScheduleConfig,interviewDate:initialScheduleConfig.date,confirmedAt:null,resultsAt:null,now:'2026-11-09T09:00'});
const primary=html=>/class="button button-primary" href="([^"]+)">([^<]+)/.exec(html).slice(1,3);

test('countdown comes from the campaign dates', () => {
  const p=intakeProgress(initialCampaign,'open','2026-11-09T09:00');
  assert.equal(p.text,'Còn 12 ngày để nộp hồ sơ');
  assert.ok(p.percent>0&&p.percent<20);
  assert.equal(intakeProgress(initialCampaign,'closed','2026-11-21T00:00').text,'Đã hết hạn nộp hồ sơ');
});

test('discover shows one primary action per role, open roles and the FAQ', () => {
  assert.deepEqual(primary(renderDiscover(base('applicant'))),['apply.html','Nộp đơn ngay']);
  assert.deepEqual(primary(renderDiscover(base('executive'))),['index.html','Quản lý đợt tuyển']);
  assert.deepEqual(primary(renderDiscover({...base('visitor'),campaign:null,intake:'draft'})),['events.html','Xem lịch trình tuyển']);
  const html=renderDiscover(base('visitor'));
  for(const p of initialCampaign.positions)assert.ok(html.includes(`recruitment.html#role-${p.id}`));
  assert.ok(html.includes('aria-current="step"'));
  assert.equal([...html.matchAll(/<details class="faq-item">/g)].length,5);
  assert.equal([...html.matchAll(/<h1\b/g)].length,1);
});

test('recruitment cards are deep-link targets with a per-position apply link', () => {
  const html=renderRecruitment(base('applicant'));
  for(const p of initialCampaign.positions){assert.ok(html.includes(`id="role-${p.id}"`));assert.ok(html.includes(`apply.html?position=${p.id}`));}
  assert.ok(!renderRecruitment({...base('applicant'),intake:'closed'}).includes('apply.html?position='));
});

test('timeline names the current phase separately from the next milestone', () => {
  const html=renderEvents(base('applicant'));
  assert.ok(html.includes('Đang nhận hồ sơ'));
  assert.ok(html.includes('còn 12 ngày'));
  assert.ok(html.includes('href="apply.html"'));
});
