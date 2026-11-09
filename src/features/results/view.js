/** Executive results page: assessments, Pass/Fail per application and publication. */
import {escapeHtml as esc,icon,formatDateTime} from '../../shared/ui.js';
import {interviewerName} from '../schedule/model.js';
import {recommendations} from '../interviews/store.js';
import {decisionLabels} from './store.js';

/** Per position: how many applications passed versus the quota. */
export function quotaSummary(campaign,items,decisions){
  return (campaign?.positions||[]).map(p=>{
    const inPosition=items.filter(i=>i.row.candidate.positionId===p.id);
    return {position:p,interviewed:inPosition.length,passed:inPosition.filter(i=>decisions[i.row.candidate.id]==='pass').length,quota:Number(p.quota)||0};
  });
}

/** Everything that still prevents publishing results. */
export function publishBlockers(items,decisions,summary){
  const blockers=[];
  const noAssessment=items.filter(i=>!i.assessment),noDecision=items.filter(i=>!decisions[i.row.candidate.id]);
  if(!items.length)blockers.push('Chưa có buổi phỏng vấn nào trong lịch đã xác nhận.');
  if(noAssessment.length)blockers.push(`${noAssessment.length} buổi chưa có đánh giá: ${noAssessment.map(i=>i.row.candidate.id).join(', ')}.`);
  if(noDecision.length)blockers.push(`${noDecision.length} hồ sơ chưa có quyết định: ${noDecision.map(i=>i.row.candidate.id).join(', ')}.`);
  for(const s of summary)if(s.passed>s.quota)blockers.push(`${s.position.name}: ${s.passed} người đạt vượt chỉ tiêu ${s.quota}.`);
  return blockers;
}

export function renderResults({confirmed,config,items,decisions,publishedAt,campaign}){
  const summary=quotaSummary(campaign,items,decisions),blockers=publishBlockers(items,decisions,summary),readOnly=Boolean(publishedAt);
  if(!confirmed)return `<div class="page-heading"><div><h1>Kết quả tuyển</h1><p>Ghi nhận Đạt/Không đạt cho từng hồ sơ sau buổi phỏng vấn.</p></div></div><div class="empty-state page-empty">${icon('lock')}<h2>Cần xác nhận lịch phỏng vấn trước</h2><p>Kết quả chỉ được ghi nhận cho những buổi phỏng vấn trong lịch đã xác nhận.</p><a class="button button-primary" href="schedule.html">Đến xếp lịch phỏng vấn</a></div>`;
  return `<div class="page-heading"><div><h1>Kết quả tuyển</h1><p>Đọc đánh giá của người phỏng vấn, ghi quyết định cho từng vị trí rồi công bố trong ứng dụng.</p></div></div>
  ${readOnly?`<div class="notice schedule-notice schedule-notice-success" role="status">${icon('check')}<div><strong>Đã công bố kết quả ${esc(formatDateTime(publishedAt))}</strong><p>Ứng viên xem kết quả trong mục Hồ sơ của tôi và nhận thông báo trong ứng dụng.</p></div></div>`:''}
  <section class="page-section" aria-labelledby="quota-title"><h2 id="quota-title">Chỉ tiêu theo vị trí</h2>
    <div class="quota-grid">${summary.map(s=>`<div class="quota-card${s.passed>s.quota?' over':''}"><strong>${esc(s.position.name)}</strong><span class="quota-value">${s.passed}/${s.quota}</span><small>đạt / chỉ tiêu · ${s.interviewed} đã phỏng vấn</small><progress class="quota-bar" max="${Math.max(1,s.quota)}" value="${Math.min(s.passed,Math.max(1,s.quota))}" aria-label="${esc(s.position.name)}: ${s.passed} trên ${s.quota} chỉ tiêu"></progress></div>`).join('')}</div>
  </section>
  <section class="list-panel" aria-labelledby="results-title">
    <div class="list-heading"><h2 id="results-title">Hồ sơ đã phỏng vấn</h2><span class="count-tag">${items.length} hồ sơ · ngày ${esc(config.date.split('-').reverse().join('/'))}</span></div>
    <div class="table-scroll" tabindex="0" role="region" aria-label="Bảng kết quả, có thể cuộn ngang">
      <table class="data-table results-table">
        <thead><tr><th scope="col">Ứng viên</th><th scope="col">Vị trí</th><th scope="col">Đánh giá</th><th scope="col">Quyết định</th></tr></thead>
        <tbody>${items.map(({row,assessment})=>{
          const c=row.candidate,d=decisions[c.id];
          return `<tr><td data-label="Ứng viên"><strong class="person-name">${esc(c.name)}</strong><small class="person-sub">${esc(c.id)} · ${esc(row.assignment.start)} · ${esc(interviewerName(row.assignment.interviewerId))}</small></td>
          <td data-label="Vị trí"><span class="role-name">${esc(c.role)}</span><small class="role-sub">${esc(c.department)}</small></td>
          <td data-label="Đánh giá">${assessment?`<strong>${assessment.score}/5</strong> · ${esc(recommendations[assessment.recommendation])}<small class="role-sub">${esc(assessment.strengths)}</small>`:'<span class="pill pill-pending">Chờ đánh giá</span>'}</td>
          <td data-label="Quyết định">${readOnly||!assessment?(d?`<span class="pill ${d==='pass'?'pill-shortlisted':'pill-rejected'}">${decisionLabels[d]}</span>`:'<span class="muted-text">—</span>'):`<div class="segmented" role="group" aria-label="Quyết định cho ${esc(c.name)}">${Object.entries(decisionLabels).map(([k,label])=>`<button type="button" class="segment segment-${k}" data-decide="${esc(c.id)}" data-value="${k}" aria-pressed="${d===k}">${label}</button>`).join('')}</div>`}</td></tr>`;}).join('')}</tbody>
      </table>
    </div>
  </section>
  ${readOnly?'':`<div class="review-bottom-nav schedule-bottom"><div class="results-blockers" id="results-blockers" role="status">${blockers.length?`${icon('info')}<span>${esc(blockers[0])}${blockers.length>1?` (+${blockers.length-1} việc khác)`:''}</span>`:`${icon('check')}<span>Đủ điều kiện công bố kết quả.</span>`}</div><button type="button" class="button button-primary" data-results-publish${blockers.length?' disabled':''}>${icon('trophy')}Công bố kết quả</button></div>`}`;
}
