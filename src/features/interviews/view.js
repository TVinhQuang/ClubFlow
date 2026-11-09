/** Interviewer page: only assigned interviews; CV and statement visible, internal review notes never shown. */
import {escapeHtml as esc,icon,formatDateTime} from '../../shared/ui.js';
import {roomName} from '../schedule/model.js';
import {recommendations} from './store.js';

const dateOnly=value=>value?value.split('-').reverse().join('/'):'';

/** items: [{row, assessment|null, canAssess:boolean}] */
export function renderInterviews({user,confirmed,config,items,positions=[]}){
  const done=items.filter(i=>i.assessment).length;
  return `<div class="page-heading"><div><p class="eyebrow">${esc(user.title)}</p><h1>Lịch phỏng vấn của tôi</h1><p>${confirmed?`Ngày ${esc(dateOnly(config.date))} · ${items.length} buổi được giao · ${done} đã đánh giá.`:'Lịch phỏng vấn chưa được ban điều hành xác nhận.'}</p></div></div>
  ${positions.length?`<p class="muted-text interviews-scope">${icon('briefcase')}Bạn phụ trách: ${positions.map(esc).join(', ')}</p>`:''}
  ${!confirmed?`<div class="empty-state page-empty">${icon('calendar')}<h2>Chưa có lịch chính thức</h2><p>Khi lịch được xác nhận, các buổi bạn được giao sẽ hiển thị tại đây cùng CV của ứng viên.</p></div>`:items.length?`<ol class="interview-list">${items.map(({row,assessment,canAssess})=>{
    const c=row.candidate,a=row.assignment;
    return `<li class="interview-card" id="interview-${esc(c.id)}">
      <div class="interview-time"><strong>${esc(a.start)}</strong><span>${esc(row.end)}</span></div>
      <div class="interview-main">
        <h2>${esc(c.name)}</h2>
        <p>${esc(c.role)} · ${esc(c.department)} · ${esc(c.id)}</p>
        <p class="muted-text">${icon('grid')}${esc(roomName(a.roomId))}</p>
        ${assessment?`<p class="interview-assessed">${icon('check')}Đã đánh giá · ${assessment.score}/5 điểm ·${esc(recommendations[assessment.recommendation])}</p>`:''}
      </div>
      <div class="interview-actions">
        <button type="button" class="button button-secondary button-small" data-interview-cv="${esc(c.id)}" aria-label="Xem hồ sơ của ${esc(c.name)}">${icon('eye')}Xem hồ sơ</button>
        ${assessment?`<button type="button" class="button button-quiet button-small" data-interview-view="${esc(c.id)}" aria-label="Xem đánh giá đã gửi cho ${esc(c.name)}">Xem đánh giá</button>`:canAssess?`<button type="button" class="button button-primary button-small" data-interview-assess="${esc(c.id)}" aria-label="Đánh giá ${esc(c.name)}">${icon('star')}Đánh giá</button>`:`<span class="interview-wait">${icon('clock')}Đánh giá sau ${esc(a.start)} ngày ${esc(dateOnly(config.date))}</span>`}
      </div>
    </li>`;}).join('')}</ol>`:`<div class="empty-state page-empty">${icon('calendar')}<h2>Bạn chưa được giao buổi nào</h2><p>Lịch đã xác nhận không có buổi phỏng vấn nào của bạn.</p></div>`}`;
}

export function renderCandidateFile(c){
  return `<dl class="fact-grid"><div><dt>MSSV</dt><dd>${esc(c.studentId)}</dd></div><div><dt>Ngành</dt><dd>${esc(c.major)} · ${esc(c.year||'')}</dd></div><div><dt>Vị trí</dt><dd>${esc(c.role)}</dd></div></dl>
  <h3 class="dialog-subhead">Nguyện vọng</h3><p class="sop-text">${esc(c.sop)}</p>
  <h3 class="dialog-subhead">CV</h3><div class="cv-card"><span class="pdf-badge" aria-hidden="true">PDF</span><div class="cv-info"><strong>${esc(c.cv)}</strong><small>Tệp minh họa; prototype không lưu PDF thật.</small></div></div>`;
}

export function renderAssessmentForm(candidate){
  return `<form id="assessment-form" data-app="${esc(candidate.id)}" novalidate>
    <p class="schedule-editor-person">${esc(candidate.name)} · ${esc(candidate.role)}</p>
    <fieldset class="rating" aria-describedby="assess-score-error"><legend>Điểm tổng quan<span class="required" aria-hidden="true">*</span></legend>
      <div class="rating-options">${[1,2,3,4,5].map(n=>`<label class="schedule-check"><input type="radio" name="score" value="${n}" id="assess-score-${n}"><span>${n}</span></label>`).join('')}</div>
      <span class="field-error" id="assess-score-error" hidden></span>
    </fieldset>
    <div class="field"><label for="assess-strengths">Điểm mạnh<span class="required" aria-hidden="true">*</span></label><textarea id="assess-strengths" name="strengths" rows="3" maxlength="1000" aria-describedby="assess-strengths-error"></textarea><span class="field-error" id="assess-strengths-error" hidden></span></div>
    <div class="field"><label for="assess-concerns">Điểm cần lưu ý</label><textarea id="assess-concerns" name="concerns" rows="3" maxlength="1000" aria-describedby="assess-concerns-error"></textarea><span class="field-error" id="assess-concerns-error" hidden></span></div>
    <fieldset class="rating" aria-describedby="assess-recommendation-error"><legend>Đề xuất<span class="required" aria-hidden="true">*</span></legend>
      <div class="rating-options">${Object.entries(recommendations).map(([k,label])=>`<label class="schedule-check"><input type="radio" name="recommendation" value="${k}"><span>${label}</span></label>`).join('')}</div>
      <span class="field-error" id="assess-recommendation-error" hidden></span>
    </fieldset>
    <p class="muted-text">Mỗi buổi chỉ gửi một đánh giá; sau khi gửi không thể sửa.</p>
  </form>`;
}

export function renderAssessmentView(a){
  return `<dl class="fact-grid"><div><dt>Điểm</dt><dd>${a.score}/5</dd></div><div><dt>Đề xuất</dt><dd>${esc(recommendations[a.recommendation])}</dd></div><div><dt>Gửi lúc</dt><dd>${esc(formatDateTime(a.submittedAt))}</dd></div></dl>
  <h3 class="dialog-subhead">Điểm mạnh</h3><p>${esc(a.strengths)}</p>${a.concerns?`<h3 class="dialog-subhead">Điểm cần lưu ý</h3><p>${esc(a.concerns)}</p>`:''}`;
}
