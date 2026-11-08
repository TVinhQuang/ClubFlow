import { escapeHtml as esc, icon, formatDateTime } from '../../shared/ui.js';

/** Match model validation paths to the corresponding, stable form control. */
export function fieldId(field) {
  if (field === 'campaign') return 'campaign-form';
  if (field === 'positions') return 'positions-list';
  const position = /^positions\.([a-zA-Z0-9-]+)\.([a-zA-Z]+)$/.exec(field);
  return position ? `position-${position[1]}-${position[2]}` : `campaign-${field}`;
}

const valueText = (value, fallback) =>
  typeof value === 'string' && value.trim() ? esc(value) : fallback;

function field({ key, label, value = '', position, type = 'text', rows, max, full = false, help, required = true }) {
  const path = position ? `positions.${position}.${key}` : key;
  const id = fieldId(path);
  const description = `${id}-error${help ? ` ${id}-help` : ''}`;
  const attributes = `id="${esc(id)}" name="${esc(position ? path : key)}" data-field="${esc(key)}"${position ? ` data-position="${esc(position)}"` : ''} aria-describedby="${esc(description)}"${required ? ' required' : ''}${max ? ` maxlength="${max}"` : ''}`;
  const control = rows
    ? `<textarea ${attributes} rows="${rows}">${esc(value)}</textarea>`
    : `<input ${attributes} type="${type}" value="${esc(value)}"${type === 'number' ? ' min="1" step="1" inputmode="numeric"' : ''}>`;
  return `<div class="field${full ? ' full-width' : ''}">
    <label for="${esc(id)}">${label}${required ? '<span class="required" aria-hidden="true">*</span>' : ''}</label>
    ${control}
    ${help ? `<small id="${esc(id)}-help">${help}</small>` : ''}
    <span class="field-error" id="${esc(id)}-error" hidden></span>
  </div>`;
}

function positionMarkup(position, index) {
  const common = { position: position.id };
  const quota = position.quota === '' || position.quota == null ? 'Chưa nhập chỉ tiêu' : `${esc(position.quota)} thành viên`;
  return `<details class="position-item" data-position-panel="${esc(position.id)}"${index === 0 || !position.name ? ' open' : ''}>
    <summary>
      <span class="position-number">${String(index + 1).padStart(2, '0')}</span>
      <span class="position-title">${valueText(position.name, 'Vị trí mới')}<small>${valueText(position.department, 'Chưa nhập ban / bộ phận')}</small></span>
      <span class="position-quota">${quota}</span>${icon('down')}
    </summary>
    <div class="position-content">
      <div class="form-grid">
        ${field({ ...common, key: 'name', label: 'Tên vị trí', value: position.name, max: 120 })}
        ${field({ ...common, key: 'department', label: 'Ban / bộ phận', value: position.department, max: 120 })}
        ${field({ ...common, key: 'quota', label: 'Chỉ tiêu', value: position.quota, type: 'number' })}
      </div>
      ${field({ ...common, key: 'description', label: 'Mô tả công việc', value: position.description, rows: 3, max: 2000 })}
      ${field({ ...common, key: 'requirements', label: 'Yêu cầu và kỹ năng', value: position.requirements, rows: 3, max: 2000 })}
      <div class="position-actions"><button type="button" class="button button-quiet danger" data-action="remove-position" data-id="${esc(position.id)}" aria-label="Xóa vị trí ${esc(position.name || 'mới')}">${icon('x')}Xóa vị trí</button></div>
    </div>
  </details>`;
}

/** A read-only preview shared by the sidebar and the full preview dialog. */
export function renderPreview(campaign, { full = false } = {}) {
  const positions = Array.isArray(campaign.positions) ? campaign.positions : [];
  return `<div class="preview-sheet${full ? ' preview-sheet-full' : ''}">
    <div class="preview-cover"><strong>Cùng làm<br>điều có ý nghĩa.</strong><span>${valueText(campaign.club, 'Chưa nhập câu lạc bộ')}</span>${icon('leaf')}</div>
    <div class="preview-content">
      <h3>${valueText(campaign.name, 'Chưa nhập tên đợt tuyển')}</h3>
      <p>${valueText(campaign.description, 'Chưa nhập giới thiệu đợt tuyển.')}</p>
      <div class="preview-date">${icon('calendar')}<span>Nhận đơn ${esc(formatDateTime(campaign.open))} – ${esc(formatDateTime(campaign.close))}</span></div>
      <div class="preview-roles">${positions.length ? positions.map(position => `<span>${valueText(position.name, 'Chưa nhập tên vị trí')}</span>`).join('') : '<span>Chưa có vị trí tuyển dụng</span>'}</div>
      ${full ? `<div class="preview-position-list">${positions.map(position => `<section class="preview-position">
        <h4>${valueText(position.name, 'Chưa nhập tên vị trí')}</h4>
        <p class="preview-position-meta">${valueText(position.department, 'Chưa nhập ban / bộ phận')} · ${position.quota === '' || position.quota == null ? 'Chưa nhập chỉ tiêu' : `${esc(position.quota)} thành viên`}</p>
        <h5>Mô tả công việc</h5><p>${valueText(position.description, 'Chưa nhập mô tả công việc.')}</p>
        <h5>Yêu cầu và kỹ năng</h5><p>${valueText(position.requirements, 'Chưa nhập yêu cầu và kỹ năng.')}</p>
      </section>`).join('')}</div>` : ''}
      <p class="preview-instructions">${valueText(campaign.instructions, 'Chưa nhập hướng dẫn ứng tuyển.')}</p>
    </div>
  </div>`;
}

export function renderCampaign(campaign, meta = {}) {
  const positions = Array.isArray(campaign.positions) ? campaign.positions : [];
  const hasPublished = Boolean(meta.hasPublished || meta.publishedAt);
  const warning = meta.warning || (meta.persisted === false ? 'Chưa thể lưu dữ liệu trên trình duyệt này. Giữ trang đang mở để tiếp tục chỉnh sửa.' : '');
  const savedMessage = meta.dirty ? 'Có thay đổi chưa lưu bản nháp' : meta.persisted === false
    ? 'Chưa lưu được trên trình duyệt này'
    : meta.savedAt ? `Đã lưu trên trình duyệt này · ${formatDateTime(meta.savedAt)}` : 'Chưa lưu bản nháp · Lưu trên trình duyệt này';
  return `<div class="page-heading">
    <div><h1>Thiết kế đợt tuyển của bạn</h1><p>Một lời mời rõ ràng để gặp đúng những người đồng hành.</p></div>
    <div class="heading-actions"><button type="button" class="button button-secondary" data-action="preview">${icon('eye')}Xem trước</button><a class="button button-primary" href="applications.html">Xem hồ sơ ứng tuyển${icon('arrow')}</a></div>
  </div>
  <div class="campaign-status" role="status">
    <span class="pill ${hasPublished ? 'published' : 'draft'}">${hasPublished ? 'Đã công bố' : 'Bản nháp'}</span>
    ${hasPublished && meta.publishedAt ? `<span>Công bố ${esc(formatDateTime(meta.publishedAt))}</span>` : ''}
    ${meta.dirty || meta.hasUnpublishedChanges ? `<span class="campaign-dirty">${hasPublished ? 'Có thay đổi chưa công bố' : 'Đang chỉnh sửa bản nháp'}</span>` : ''}
  </div>
  ${warning ? `<div class="notice notice-warning" role="status">${icon('info')}<div><strong>Lưu trữ trên trình duyệt</strong><p>${esc(warning)}</p></div></div>` : ''}
  <form id="campaign-form" novalidate tabindex="-1">
    <div id="campaign-errors" class="error-summary" role="alert" hidden tabindex="-1"></div>
    <div class="form-layout">
      <div>
        <section class="form-panel">
          <h2>Thông tin đợt tuyển</h2><p>Giúp ứng viên hiểu câu lạc bộ và cơ hội dành cho mình.</p>
          <div class="form-grid">
            ${field({ key: 'name', label: 'Tên đợt tuyển', value: campaign.name, full: true, max: 120 })}
            ${field({ key: 'club', label: 'Câu lạc bộ tổ chức', value: campaign.club, full: true, max: 120 })}
            ${field({ key: 'description', label: 'Giới thiệu đợt tuyển', value: campaign.description, full: true, rows: 3, max: 1200, help: 'Một lời giới thiệu ngắn, chân thành và mang dấu ấn của CLB.' })}
            ${field({ key: 'open', label: 'Ngày mở đơn', value: campaign.open, type: 'datetime-local', help: 'Giờ địa phương Việt Nam' })}
            ${field({ key: 'close', label: 'Ngày đóng đơn', value: campaign.close, type: 'datetime-local', help: 'Giờ địa phương Việt Nam' })}
            ${field({ key: 'instructions', label: 'Hướng dẫn ứng tuyển', value: campaign.instructions, full: true, rows: 3, max: 2000 })}
          </div>
        </section>
        <section class="form-panel">
          <div class="positions-head"><div><h2>Vị trí đang tìm đồng đội</h2><p>Mỗi vị trí là một cơ hội để cùng nhau phát triển.</p></div><button type="button" class="button button-secondary button-small" data-action="add-position">${icon('plus')}Thêm vị trí</button></div>
          <div id="positions-list" tabindex="-1" aria-describedby="positions-list-error">${positions.length ? positions.map(positionMarkup).join('') : '<div class="positions-empty"><p>Chưa có vị trí tuyển dụng. Thêm một vị trí để bắt đầu.</p></div>'}</div>
          <span id="positions-list-error" class="field-error" hidden></span>
        </section>
      </div>
      <aside class="campaign-preview" aria-label="Xem trước trang ứng tuyển">
        <div class="preview-top"><span>Ứng viên sẽ nhìn thấy</span>${icon('eye')}</div>
        <div id="campaign-live-preview">${renderPreview(campaign)}</div>
        <button type="button" class="button button-secondary preview-expand" data-action="preview">Xem đầy đủ đợt tuyển${icon('arrow')}</button>
        <p class="preview-note">${icon('info')}Bản xem trước giúp bạn kiểm tra thông tin trước khi công bố.</p>
      </aside>
    </div>
    <div class="form-bottom">
      <span class="save-state" id="campaign-save-state">${icon(meta.dirty || !meta.persisted || !meta.savedAt ? 'info' : 'check')}${esc(savedMessage)}</span>
      <div><button id="campaign-save-draft" type="button" class="button button-secondary" data-action="save-draft">Lưu bản nháp</button><button id="campaign-publish" type="submit" class="button button-primary" data-action="publish">${icon('check')}Công bố đợt tuyển</button></div>
    </div>
  </form>`;
}
