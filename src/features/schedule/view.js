/** Owner: Nguyễn Thái Cường — 24127336. Markup for screen 3; shared by static generation and the controller. */
import {escapeHtml as esc,icon,formatDateTime} from '../../shared/ui.js';
import {DURATIONS,generateSlots,interviewerName,roomName,addMinutes,toMinutes} from './model.js';
import {interviewerCatalog,roomCatalog} from './seed.js';

export const statusMeta={
  proposed:{label:'Đề xuất',icon:'clock'},
  conflict:{label:'Xung đột',icon:'alert'},
  unassigned:{label:'Chưa xếp',icon:'info'},
  confirmed:{label:'Đã xác nhận',icon:'check'}
};
export const statusBadge=status=>`<span class="pill schedule-pill schedule-pill-${esc(status)}">${icon(statusMeta[status]?.icon||'info')}${esc(statusMeta[status]?.label||status)}</span>`;
const dayText=date=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return 'Chưa chọn ngày';
  const [y,m,d]=date.split('-').map(Number);
  return new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d)));
};
const positionsOf=campaign=>Array.isArray(campaign?.positions)?campaign.positions:[];

function fieldError(id){return `<span class="field-error" id="${id}-error" hidden></span>`;}

export function renderConfig(config,{campaign,readOnly=false}={}){
  const positions=positionsOf(campaign);
  const interviewers=interviewerCatalog.map(person=>{
    const setting=config.interviewers.find(i=>i.id===person.id)||{positionIds:[],from:config.start,to:config.end};
    const base=`schedule-iv-${person.id}`;
    return `<fieldset class="schedule-person" data-interviewer="${esc(person.id)}" aria-describedby="${base}-error">
      <legend><span class="avatar mint" aria-hidden="true">${esc(person.name.split(' ').slice(-2).map(w=>w[0]).join(''))}</span><span><strong>${esc(person.name)}</strong><small>${esc(person.title)}</small></span></legend>
      <div class="schedule-checks" role="group" aria-label="Vị trí ${esc(person.name)} phỏng vấn">
        ${positions.map(p=>`<label class="schedule-check"><input type="checkbox" data-config="position" data-interviewer="${esc(person.id)}" value="${esc(p.id)}"${setting.positionIds.includes(p.id)?' checked':''}><span>${esc(p.name)}</span></label>`).join('')||'<p class="schedule-muted">Chưa có vị trí đã công bố.</p>'}
      </div>
      <div class="schedule-range">
        <div class="field"><label for="${base}-from">Rảnh từ</label><input id="${base}-from" type="time" step="300" data-config="from" data-interviewer="${esc(person.id)}" value="${esc(setting.from)}"></div>
        <div class="field"><label for="${base}-to">Đến</label><input id="${base}-to" type="time" step="300" data-config="to" data-interviewer="${esc(person.id)}" value="${esc(setting.to)}"></div>
      </div>
      ${fieldError(base)}
    </fieldset>`;
  }).join('');
  return `<form class="schedule-config form-panel" id="schedule-config" novalidate aria-labelledby="schedule-config-title">
    <h2 id="schedule-config-title">Cấu hình buổi phỏng vấn</h2>
    <p>Mỗi đợt tuyển có một ngày phỏng vấn và cùng một thời lượng cho mọi buổi.</p>
    <fieldset class="schedule-fieldset"${readOnly?' disabled':''}>
      <legend class="sr-only">Cấu hình lịch phỏng vấn</legend>
      <div class="schedule-config-grid">
        <div class="field full-width"><label for="schedule-date">Ngày phỏng vấn<span class="required" aria-hidden="true">*</span></label><input id="schedule-date" type="date" data-config="date" value="${esc(config.date)}" aria-describedby="schedule-date-help schedule-date-error" required><small id="schedule-date-help">Sau hạn đóng đơn ${esc(formatDateTime(campaign?.close))}</small>${fieldError('schedule-date')}</div>
        <div class="field"><label for="schedule-start">Bắt đầu</label><input id="schedule-start" type="time" step="300" data-config="start" value="${esc(config.start)}" aria-describedby="schedule-start-error" required>${fieldError('schedule-start')}</div>
        <div class="field"><label for="schedule-end">Kết thúc</label><input id="schedule-end" type="time" step="300" data-config="end" value="${esc(config.end)}" aria-describedby="schedule-end-error" required>${fieldError('schedule-end')}</div>
        <div class="field full-width"><label for="schedule-duration">Thời lượng mỗi buổi</label><select id="schedule-duration" data-config="duration" aria-describedby="schedule-duration-error">${DURATIONS.map(d=>`<option value="${d}"${Number(config.duration)===d?' selected':''}>${d} phút</option>`).join('')}</select>${fieldError('schedule-duration')}</div>
      </div>
      <h3 class="schedule-subhead">Người phỏng vấn</h3>
      <p class="schedule-muted" id="schedule-interviewers-help">Chọn vị trí mỗi người phụ trách và giờ họ rảnh trong ngày.</p>
      <div class="schedule-people" id="schedule-interviewers" tabindex="-1" aria-describedby="schedule-interviewers-help schedule-interviewers-error">${interviewers}</div>
      ${fieldError('schedule-interviewers')}
      <h3 class="schedule-subhead">Phòng phỏng vấn</h3>
      <div class="schedule-checks schedule-rooms" id="schedule-rooms" role="group" aria-label="Phòng phỏng vấn" tabindex="-1" aria-describedby="schedule-rooms-error">
        ${roomCatalog.map(r=>`<label class="schedule-check"><input type="checkbox" data-config="room" value="${esc(r.id)}"${config.roomIds.includes(r.id)?' checked':''}><span>${esc(r.name)}</span></label>`).join('')}
      </div>
      ${fieldError('schedule-rooms')}
      <button type="submit" class="button button-secondary schedule-generate" id="schedule-generate">${icon('calendar')}Tạo lịch nháp</button>
    </fieldset>
  </form>`;
}

function personCell(c){
  return `<span class="person-cell"><span class="avatar ${esc(c.color||'mint')}" aria-hidden="true">${esc(c.initials||'UV')}</span><span class="person-info"><strong class="person-name">${esc(c.name)}</strong><small class="person-sub">${esc(c.studentId)} · ${esc(c.id)}</small></span></span>`;
}

function rowAction(row,readOnly){
  if(readOnly||row.status==='confirmed')return '<span class="schedule-muted">Chỉ xem</span>';
  const name=esc(row.candidate.name),id=esc(row.candidate.id);
  if(row.status==='unassigned')return `<button type="button" class="button button-secondary button-small" data-schedule-edit="${id}" aria-label="Gán lịch cho ${name}, ${id}">${icon('plus')}Gán lịch</button>`;
  if(row.status==='conflict')return `<button type="button" class="button button-danger button-small" data-schedule-edit="${id}" aria-label="Giải quyết xung đột của ${name}, ${id}">${icon('alert')}Giải quyết</button>`;
  return `<button type="button" class="button button-quiet button-small" data-schedule-edit="${id}" aria-label="Sửa lịch của ${name}, ${id}">Sửa</button>`;
}

export function renderRows(rows,{readOnly=false}={}){
  return rows.map(row=>{
    const a=row.assignment,c=row.candidate;
    const time=a?`<strong class="schedule-time">${esc(a.start)}–${esc(row.end)}</strong>`:'<span class="schedule-muted">Chưa có giờ</span>';
    const detail=row.status==='unassigned'?`<small class="schedule-reason">${esc(row.reason)}</small>`:row.issues.length?`<ul class="schedule-issues">${row.issues.map(i=>`<li>${esc(i.message)}</li>`).join('')}</ul>`:'';
    return `<tr id="schedule-row-${esc(c.id)}" class="schedule-row schedule-row-${esc(row.status)}">
      <td data-label="Giờ">${time}</td>
      <td data-label="Ứng viên">${personCell(c)}</td>
      <td data-label="Vị trí"><span class="role-name">${esc(c.role)}</span><small class="role-sub">${esc(c.department)}</small></td>
      <td data-label="Người phỏng vấn">${a?esc(interviewerName(a.interviewerId)):'<span class="schedule-muted">—</span>'}</td>
      <td data-label="Phòng">${a?esc(roomName(a.roomId)):'<span class="schedule-muted">—</span>'}</td>
      <td data-label="Trạng thái">${statusBadge(row.status)}${detail}</td>
      <td data-label="Thao tác" class="schedule-action-cell">${rowAction(row,readOnly)}</td>
    </tr>`;
  }).join('');
}

export function renderAlerts(rows){
  const conflicts=rows.filter(r=>r.status==='conflict'),unassigned=rows.filter(r=>r.status==='unassigned');
  let html='';
  if(conflicts.length)html+=`<div class="notice schedule-notice schedule-notice-danger">${icon('alert')}<div><strong>${conflicts.length} lịch đang xung đột</strong><ul>${conflicts.map(r=>`<li><a href="#schedule-row-${esc(r.candidate.id)}">${esc(r.candidate.id)} · ${esc(r.candidate.name)}</a>: ${esc(r.issues[0]?.message||'')}</li>`).join('')}</ul></div></div>`;
  if(unassigned.length)html+=`<div class="notice notice-warning schedule-notice">${icon('info')}<div><strong>${unassigned.length} hồ sơ chưa có lịch</strong><ul>${unassigned.map(r=>`<li><a href="#schedule-row-${esc(r.candidate.id)}">${esc(r.candidate.id)} · ${esc(r.candidate.name)}</a>: ${esc(r.reason)}</li>`).join('')}</ul></div></div>`;
  return html;
}

export function renderStats(stats){
  const card=(key,label,dot,context)=>`<div class="stat-card"><div class="stat-top"><span class="stat-dot ${dot}" aria-hidden="true"></span>${label}</div><span class="stat-value" data-stat="${key}">${stats[key]}</span><span class="stat-context">${context}</span></div>`;
  return `<div class="stats-strip schedule-stats" role="group" aria-label="Thống kê lịch phỏng vấn, tổng ${stats.total} hồ sơ">
    ${card('proposed','Đề xuất','dot-neutral','chờ xác nhận')}
    ${card('conflict','Xung đột','dot-danger','cần giải quyết')}
    ${card('unassigned','Chưa xếp','dot-amber','cần gán lịch')}
    ${card('confirmed','Đã xác nhận','dot-success','lịch chính thức')}
  </div>`;
}

export function renderBoard(rows,stats,{readOnly=false}={}){
  return `${renderStats(stats)}
  <div id="schedule-alerts">${renderAlerts(rows)}</div>
  <section class="list-panel schedule-board" aria-labelledby="schedule-board-title">
    <div class="list-heading"><h2 id="schedule-board-title">Bảng lịch phỏng vấn</h2><span class="count-tag">${stats.total} hồ sơ qua vòng CV</span></div>
    <div class="table-scroll schedule-table-wrap" tabindex="0" role="region" aria-label="Bảng lịch phỏng vấn, có thể cuộn ngang">
      <table class="data-table schedule-table">
        <caption class="sr-only">Lịch phỏng vấn theo giờ. Tổng ${stats.total} hồ sơ: ${stats.proposed} đề xuất, ${stats.conflict} xung đột, ${stats.unassigned} chưa xếp, ${stats.confirmed} đã xác nhận.</caption>
        <thead><tr><th scope="col">Giờ</th><th scope="col">Ứng viên</th><th scope="col">Vị trí</th><th scope="col">Người phỏng vấn</th><th scope="col">Phòng</th><th scope="col">Trạng thái</th><th scope="col"><span class="sr-only">Thao tác</span></th></tr></thead>
        <tbody id="schedule-rows">${renderRows(rows,{readOnly})}</tbody>
      </table>
      ${rows.length?'':`<div class="empty-state">${icon('calendar')}<h3>Chưa có hồ sơ qua vòng CV</h3><p>Hãy cho qua vòng CV ít nhất một hồ sơ ở bước 2 để bắt đầu xếp lịch.</p><a class="button button-secondary" href="applications.html">Đến duyệt hồ sơ</a></div>`}
    </div>
    <p class="schedule-total" id="schedule-total">Tổng ${stats.total} = ${stats.proposed} đề xuất + ${stats.conflict} xung đột + ${stats.unassigned} chưa xếp + ${stats.confirmed} đã xác nhận</p>
  </section>`;
}

export function renderSchedule({rows,stats,campaign,config,meta={},dirty=false}){
  const readOnly=Boolean(meta.confirmedAt);
  const saveText=readOnly?`Đã xác nhận ${esc(formatDateTime(meta.confirmedAt))}`:dirty?'Có thay đổi chưa lưu':meta.persisted===false?'Chưa lưu được trên trình duyệt này':meta.savedAt?`Đã lưu nháp · ${esc(formatDateTime(meta.savedAt))}`:'Lịch nháp mẫu · chưa lưu trên trình duyệt này';
  return `<div class="page-heading">
    <div><h1>Xếp lịch phỏng vấn</h1><p>Tạo lịch nháp cho các hồ sơ qua vòng CV, xử lý xung đột rồi xác nhận lịch chính thức.</p></div>
    <div class="heading-actions"><button type="button" class="button button-secondary" data-schedule-action="export">${icon('download')}Xuất lịch (CSV)</button></div>
  </div>
  <div class="campaign-ribbon" role="region" aria-label="Thông tin buổi phỏng vấn">
    <div class="ribbon-main">${icon('calendar')}<div><strong>${esc(campaign?.name||'Chưa có đợt tuyển đã công bố')}</strong><small>Phỏng vấn ${esc(dayText(config.date))} · ${esc(config.start)}–${esc(config.end)} · ${esc(config.duration)} phút/buổi</small></div></div>
    <div class="ribbon-meta">${readOnly?statusBadge('confirmed'):'<span class="pill draft">Bản nháp</span>'}</div>
  </div>
  ${meta.warning?`<div class="notice notice-warning" role="status">${icon('info')}<div><strong>Lưu trữ trên trình duyệt</strong><p>${esc(meta.warning)}</p></div></div>`:''}
  ${readOnly?`<div class="notice schedule-notice schedule-notice-success" role="status">${icon('lock')}<div><strong>Lịch đã được xác nhận</strong><p>Cấu hình và lịch chỉ có thể xem. Ứng viên và người phỏng vấn xem lịch của mình trong tài khoản.</p></div></div>`:''}
  <div class="schedule-layout">
    ${renderConfig(config,{campaign,readOnly})}
    <div class="schedule-main" id="schedule-main">${renderBoard(rows,stats,{readOnly})}</div>
  </div>
  <div class="review-bottom-nav schedule-bottom">
    <span class="save-state" id="schedule-save-state">${icon(readOnly?'lock':dirty?'info':'check')}${saveText}</span>
    <div class="schedule-bottom-actions">
      <a class="button button-quiet" href="applications.html">${icon('chevron')}Về duyệt hồ sơ</a>
      ${readOnly?`<a class="button button-primary" href="results.html">Xem kết quả tuyển${icon('arrow')}</a>`:`<button type="button" class="button button-secondary" id="schedule-save" data-schedule-action="save">Lưu thay đổi</button><button type="button" class="button button-primary" id="schedule-confirm" data-schedule-action="confirm">${icon('check')}Duyệt &amp; xác nhận lịch</button>`}
    </div>
  </div>`;
}

/** Dialog body for Edit / Resolve / Assign. Only qualified interviewers are offered. */
export function renderEditor(row,{config,check}){
  const c=row.candidate,a=row.assignment||{};
  const qualified=config.interviewers.filter(i=>i.positionIds.includes(c.positionId));
  const slots=generateSlots(config);
  return `<form id="schedule-editor" data-app="${esc(c.id)}" novalidate>
    <p class="schedule-editor-person">${esc(c.name)} · ${esc(c.id)}<br><small>${esc(c.role)} — ${esc(c.department)}</small></p>
    ${qualified.length?'':`<p class="field-error">Chưa có người phỏng vấn phụ trách vị trí này. Hãy phân công trong phần cấu hình trước.</p>`}
    <div class="schedule-editor-grid">
      <div class="field"><label for="editor-start">Giờ phỏng vấn</label><select id="editor-start" data-editor="start"><option value="">Chọn giờ</option>${slots.map(s=>`<option value="${s.start}"${a.start===s.start?' selected':''}>${s.start}–${s.end}</option>`).join('')}</select></div>
      <div class="field"><label for="editor-interviewer">Người phỏng vấn</label><select id="editor-interviewer" data-editor="interviewerId"><option value="">Chọn người phỏng vấn</option>${qualified.map(i=>`<option value="${esc(i.id)}"${a.interviewerId===i.id?' selected':''}>${esc(interviewerName(i.id))} (rảnh ${esc(i.from)}–${esc(i.to)})</option>`).join('')}</select></div>
      <div class="field"><label for="editor-room">Phòng</label><select id="editor-room" data-editor="roomId"><option value="">Chọn phòng</option>${config.roomIds.map(id=>`<option value="${esc(id)}"${a.roomId===id?' selected':''}>${esc(roomName(id))}</option>`).join('')}</select></div>
    </div>
    <div id="editor-check" class="schedule-editor-check" role="status" aria-live="polite">${renderEditorCheck(check)}</div>
  </form>`;
}

export function renderEditorCheck(check){
  if(!check)return '<p class="schedule-muted">Chọn giờ, người phỏng vấn và phòng để kiểm tra.</p>';
  if(!check.length)return `<p class="schedule-ok">${icon('check')}Không có xung đột với người, giờ và phòng.</p>`;
  return `<p class="schedule-bad">${icon('alert')}Lựa chọn này sẽ tạo xung đột:</p><ul class="schedule-issues">${check.map(i=>`<li>${esc(i.message)}</li>`).join('')}</ul>`;
}

export function renderConfirmSummary(stats,blockers,config){
  return `<p>Ngày ${esc(dayText(config.date))}, ${esc(config.duration)} phút mỗi buổi.</p>
  <dl class="schedule-summary">
    <div><dt>Hồ sơ qua vòng CV</dt><dd>${stats.total}</dd></div>
    <div><dt>Có lịch hợp lệ</dt><dd>${stats.proposed+stats.confirmed}</dd></div>
    <div><dt>Xung đột</dt><dd>${stats.conflict}</dd></div>
    <div><dt>Chưa xếp</dt><dd>${stats.unassigned}</dd></div>
  </dl>
  ${blockers.length?`<div class="notice notice-warning" role="alert">${icon('alert')}<div><strong>Chưa thể xác nhận</strong><ul>${blockers.map(b=>`<li>${esc(b.message)}${b.ids.length?` <small>(${b.ids.map(esc).join(', ')})</small>`:''}</li>`).join('')}</ul></div></div>`:`<p>Sau khi xác nhận, cấu hình đợt tuyển, hồ sơ và lịch chuyển sang chỉ xem. Thao tác này không gửi email hay công bố kết quả.</p>`}`;
}

export function scheduleCsvRows(rows){
  return [['Giờ bắt đầu','Giờ kết thúc','Mã hồ sơ','Ứng viên','MSSV','Vị trí','Ban','Người phỏng vấn','Phòng','Trạng thái','Ghi chú'],
    ...rows.map(r=>[r.assignment?.start||'',r.end||'',r.candidate.id,r.candidate.name,r.candidate.studentId,r.candidate.role,r.candidate.department,r.assignment?interviewerName(r.assignment.interviewerId):'',r.assignment?roomName(r.assignment.roomId):'',statusMeta[r.status].label,r.reason||r.issues.map(i=>i.message).join(' ')])];
}
export {toMinutes,addMinutes};
