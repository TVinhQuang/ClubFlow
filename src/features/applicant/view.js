/** Applicant pages: application form and "my applications". Internal review notes are never rendered here. */
import {escapeHtml as esc,icon,formatDateTime} from '../../shared/ui.js';
import {availabilityBlocks,MAX_WORDS,countWords} from './model.js';
import {decisionLabels} from '../results/store.js';

const dateOnly=value=>value?value.split('-').reverse().join('/'):'';
const err=id=>`<span class="field-error" id="${id}-error" hidden></span>`;

export function renderApply({campaign,intake,user,mine=[],config,values={}}){
  if(!campaign)return `<div class="page-heading"><div><h1>Nộp đơn ứng tuyển</h1><p>Chưa có đợt tuyển nào được công bố.</p></div></div><div class="empty-state page-empty">${icon('calendar')}<h2>Chưa có đợt tuyển</h2><p>Khi câu lạc bộ công bố đợt tuyển, bạn có thể nộp đơn tại đây.</p><a class="button button-secondary" href="recruitment.html">Xem đợt tuyển</a></div>`;
  const appliedIds=new Map(mine.map(a=>[a.positionId,a.id]));
  const blocks=availabilityBlocks(config),chosen=new Set(values.availability||[]);
  const closed=intake!=='open';
  return `<div class="page-heading"><div><p class="eyebrow">${esc(campaign.name)}</p><h1>Nộp đơn ứng tuyển</h1><p>Mỗi vị trí cần một hồ sơ riêng. Hạn nhận đơn ${esc(formatDateTime(campaign.close))}.</p></div><div class="heading-actions"><a class="button button-secondary" href="my-applications.html">${icon('file')}Hồ sơ của tôi</a></div></div>
  ${closed?`<div class="notice notice-warning" role="status">${icon('lock')}<div><strong>${intake==='closed'?'Đợt tuyển đã đóng nhận đơn':'Đợt tuyển chưa mở nhận đơn'}</strong><p>${intake==='closed'?'Bạn vẫn có thể theo dõi hồ sơ đã nộp.':`Nhận đơn từ ${esc(formatDateTime(campaign.open))}.`}</p></div></div>`:''}
  <form id="apply-form" class="apply-layout" novalidate>
    <div id="apply-errors" class="error-summary" role="alert" tabindex="-1" hidden></div>
    <fieldset class="form-panel apply-panel"${closed?' disabled':''}>
      <legend class="apply-legend"><span class="step-number">1</span>Vị trí ứng tuyển</legend>
      <div class="field"><label for="apply-positionId">Vị trí<span class="required" aria-hidden="true">*</span></label>
        <select id="apply-positionId" name="positionId" aria-describedby="apply-positionId-help apply-positionId-error" required>
          <option value="">Chọn vị trí</option>
          ${campaign.positions.map(p=>`<option value="${esc(p.id)}"${values.positionId===p.id?' selected':''}>${esc(p.name)} — ${esc(p.department)}${appliedIds.has(p.id)?` (đã nộp ${esc(appliedIds.get(p.id))})`:''}</option>`).join('')}
        </select>
        <small id="apply-positionId-help">Muốn ứng tuyển nhiều vị trí? Nộp thêm hồ sơ cho từng vị trí.</small>${err('apply-positionId')}
      </div>
    </fieldset>
    <fieldset class="form-panel apply-panel"${closed?' disabled':''}>
      <legend class="apply-legend"><span class="step-number">2</span>Thông tin sinh viên</legend>
      <div class="form-grid">
        <div class="field"><label for="apply-name">Họ và tên<span class="required" aria-hidden="true">*</span></label><input id="apply-name" name="name" autocomplete="name" maxlength="120" value="${esc(values.name??user.name)}" aria-describedby="apply-name-error" required>${err('apply-name')}</div>
        <div class="field"><label for="apply-studentId">MSSV</label><input id="apply-studentId" name="studentId" value="${esc(user.studentId||'')}" readonly aria-describedby="apply-studentId-help"><small id="apply-studentId-help">Lấy từ tài khoản của bạn.</small></div>
        <div class="field"><label for="apply-email">Email<span class="required" aria-hidden="true">*</span></label><input id="apply-email" name="email" type="email" autocomplete="email" value="${esc(values.email??user.email??'')}" aria-describedby="apply-email-error" required>${err('apply-email')}</div>
        <div class="field"><label for="apply-year">Năm học</label><select id="apply-year" name="year">${['Năm 1','Năm 2','Năm 3','Năm 4','Năm 5 trở lên'].map(y=>`<option${(values.year??user.year)===y?' selected':''}>${y}</option>`).join('')}</select></div>
        <div class="field full-width"><label for="apply-major">Ngành học<span class="required" aria-hidden="true">*</span></label><input id="apply-major" name="major" maxlength="120" value="${esc(values.major??user.major??'')}" aria-describedby="apply-major-error" required>${err('apply-major')}</div>
      </div>
    </fieldset>
    <fieldset class="form-panel apply-panel"${closed?' disabled':''}>
      <legend class="apply-legend"><span class="step-number">3</span>CV và nguyện vọng</legend>
      <div class="field"><label for="apply-cv">CV (PDF, tối đa 5 MB)<span class="required" aria-hidden="true">*</span></label><input id="apply-cv" name="cv" type="file" accept="application/pdf,.pdf" aria-describedby="apply-cv-help apply-cv-error" required><small id="apply-cv-help">Prototype chỉ kiểm tra tên, định dạng và dung lượng; tệp không được tải lên máy chủ.</small>${err('apply-cv')}</div>
      <div class="field apply-motivation"><label for="apply-motivation">Nguyện vọng<span class="required" aria-hidden="true">*</span></label><textarea id="apply-motivation" name="motivation" rows="6" aria-describedby="apply-motivation-count apply-motivation-error" required>${esc(values.motivation||'')}</textarea><small id="apply-motivation-count" class="word-count" aria-live="polite">${countWords(values.motivation)}/${MAX_WORDS} từ</small>${err('apply-motivation')}</div>
    </fieldset>
    <fieldset class="form-panel apply-panel" id="apply-availability" tabindex="-1" aria-describedby="apply-availability-help apply-availability-error"${closed?' disabled':''}>
      <legend class="apply-legend"><span class="step-number">4</span>Giờ có thể phỏng vấn</legend>
      <p id="apply-availability-help" class="muted-text">Ngày ${esc(dateOnly(config.date))}. Chọn tất cả khung giờ bạn có thể tham gia.</p>
      <div class="schedule-checks">${blocks.map(b=>{const v=`${b.from}-${b.to}`;return `<label class="schedule-check"><input type="checkbox" name="availability" value="${v}"${chosen.has(v)?' checked':''}><span>${b.from}–${b.to}</span></label>`;}).join('')}</div>
      ${err('apply-availability')}
    </fieldset>
    <div class="form-bottom"><span class="save-state">${icon('info')}Hồ sơ được lưu trên trình duyệt này để minh họa.</span><div><button type="submit" class="button button-primary" id="apply-submit"${closed?' disabled':''}>${icon('upload')}Nộp hồ sơ</button></div></div>
  </form>`;
}

export function renderApplySuccess(application){
  return `<section class="access-panel success-panel" tabindex="-1" id="apply-success"><span class="access-icon">${icon('check')}</span><h1>Đã nhận hồ sơ ${esc(application.id)}</h1><p>Hồ sơ ${esc(application.role)} đang chờ ban tuyển dụng duyệt CV. Bạn theo dõi trạng thái, lịch phỏng vấn và kết quả trong mục Hồ sơ của tôi.</p><div class="access-actions"><a class="button button-primary" href="my-applications.html#app-${esc(application.id)}">Xem hồ sơ của tôi${icon('arrow')}</a><a class="button button-secondary" href="apply.html">Nộp thêm vị trí khác</a></div></section>`;
}

const cvText={pending:['Đang chờ duyệt CV','pill-pending','clock'],shortlisted:['Qua vòng CV','pill-shortlisted','check'],rejected:['Không qua vòng CV','pill-rejected','x']};

/** items: [{application, interview:{date,start,end,room,interviewer}|null, scheduleConfirmed, result}] */
export function renderMine({user,items}){
  return `<div class="page-heading"><div><h1>Hồ sơ ứng tuyển của tôi</h1><p>${esc(user.name)} · MSSV ${esc(user.studentId||'')}. Mỗi vị trí được xét riêng.</p></div><div class="heading-actions"><a class="button button-primary" href="apply.html">${icon('plus')}Nộp hồ sơ mới</a></div></div>
  ${items.length?`<div class="mine-list">${items.map(({application:a,interview,scheduleConfirmed,result})=>{
    const [cvLabel,cvClass,cvIcon]=cvText[a.status]||cvText.pending;
    const steps=[
      ['Đã nộp',true],['Vòng CV',a.status!=='pending'],['Phỏng vấn',Boolean(interview)],['Kết quả',Boolean(result)]
    ];
    return `<article class="mine-card" id="app-${esc(a.id)}" tabindex="-1" aria-labelledby="app-${esc(a.id)}-title">
      <div class="mine-head"><div><h2 id="app-${esc(a.id)}-title">${esc(a.role)}</h2><p>${esc(a.department)} · ${esc(a.id)} · Nộp ${esc(formatDateTime(a.submitted))}</p></div><span class="pill ${cvClass}">${icon(cvIcon)}${cvLabel}</span></div>
      <ol class="mine-steps">${steps.map(([label,done])=>`<li class="${done?'done':''}"><span aria-hidden="true">${done?icon('check'):''}</span>${label}<span class="sr-only">${done?': đã xong':': chưa đến'}</span></li>`).join('')}</ol>
      <div class="mine-body">
        <section aria-label="Lịch phỏng vấn"><h3>Lịch phỏng vấn</h3>${a.status==='rejected'?'<p class="muted-text">Hồ sơ không vào vòng phỏng vấn.</p>':a.status==='pending'?'<p class="muted-text">Chờ kết quả vòng CV.</p>':interview?`<dl class="fact-grid"><div><dt>Thời gian</dt><dd>${esc(dateOnly(interview.date))} · ${esc(interview.start)}–${esc(interview.end)}</dd></div><div><dt>Phòng</dt><dd>${esc(interview.room)}</dd></div><div><dt>Người phỏng vấn</dt><dd>${esc(interview.interviewer)}</dd></div></dl>`:`<p class="muted-text">${scheduleConfirmed?'Lịch đã xác nhận nhưng hồ sơ này chưa có buổi; ban tuyển dụng sẽ liên hệ.':'Lịch sẽ hiển thị tại đây khi câu lạc bộ xác nhận.'}</p>`}</section>
        <section aria-label="Kết quả"><h3>Kết quả</h3>${result?`<p class="mine-result mine-result-${esc(result)}">${icon(result==='pass'?'trophy':'info')}${result==='pass'?'Chúc mừng! Bạn đã đạt vị trí này.':'Rất tiếc, bạn chưa phù hợp với vị trí này lần này.'}</p>`:`<p class="muted-text">${a.status==='rejected'?'Kết thúc ở vòng CV.':'Chưa công bố.'}</p>`}</section>
      </div>
    </article>`;}).join('')}</div>`:`<div class="empty-state page-empty">${icon('file')}<h2>Bạn chưa nộp hồ sơ nào</h2><p>Xem các vị trí đang tuyển và nộp hồ sơ cho vị trí phù hợp.</p><a class="button button-primary" href="apply.html">Nộp đơn ứng tuyển</a></div>`}`;
}
export {decisionLabels};
