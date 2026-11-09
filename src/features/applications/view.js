import { escapeHtml as esc, icon, formatDateTime } from '../../shared/ui.js';

const statusLabels = {
  pending: 'Chờ duyệt',
  shortlisted: 'Qua vòng CV',
  rejected: 'Đã loại'
};

const statusIcons = {
  pending: 'clock',
  shortlisted: 'check',
  rejected: 'x'
};

export function statusBadge(status) {
  const label = statusLabels[status] || status;
  const iconName = statusIcons[status] || 'info';
  return `<span class="pill pill-${esc(status)}">${icon(iconName)}${esc(label)}</span>`;
}

export function personAvatar(candidate) {
  return `<span class="person-cell">
    <span class="avatar ${esc(candidate.color || 'mint')}">${esc(candidate.initials || 'UV')}</span>
    <span class="person-info">
      <strong class="person-name">${esc(candidate.name)}</strong>
      <small class="person-sub">${esc(candidate.studentId)} · ${esc(candidate.id)}</small>
    </span>
  </span>`;
}

export const PAGE_SIZE = 5;
export const sortOptions = {
  'submitted-desc': ['Mới nộp trước', (a, b) => b.submitted.localeCompare(a.submitted)],
  'submitted-asc': ['Nộp sớm trước', (a, b) => a.submitted.localeCompare(b.submitted)],
  'name-asc': ['Tên A–Z', (a, b) => a.name.split(' ').at(-1).localeCompare(b.name.split(' ').at(-1), 'vi') || a.name.localeCompare(b.name, 'vi')],
  'role-asc': ['Vị trí A–Z', (a, b) => a.role.localeCompare(b.role, 'vi') || a.submitted.localeCompare(b.submitted)]
};
export const intakeLabels = { draft: ['Chưa công bố', 'draft'], upcoming: ['Sắp nhận đơn', 'draft'], open: ['Đang nhận đơn', 'published'], closed: ['Đã đóng đơn', 'closed'] };

/** Sort, then cut one page. Returns the page rows and paging facts for the footer. */
export function paginate(applications, { sort = 'submitted-desc', page = 1 } = {}) {
  const sorted = [...applications].sort((sortOptions[sort] || sortOptions['submitted-desc'])[1]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * PAGE_SIZE;
  return { rows: sorted.slice(start, start + PAGE_SIZE), page: current, pages, from: sorted.length ? start + 1 : 0, to: Math.min(start + PAGE_SIZE, sorted.length), total: sorted.length };
}

export function renderPager(info) {
  return `<span id="list-count">Hiển thị ${info.from}–${info.to} trong ${info.total} hồ sơ</span>
    <nav class="pagination" aria-label="Phân trang hồ sơ">
      <button type="button" class="button button-secondary button-small" data-page="${info.page - 1}" ${info.page <= 1 ? 'disabled' : ''} aria-label="Trang trước" title="Trang trước">${icon('back')}</button>
      <span class="page-status" aria-live="polite">Trang <span class="page-current">${info.page}</span> / ${info.pages}</span>
      <button type="button" class="button button-secondary button-small" data-page="${info.page + 1}" ${info.page >= info.pages ? 'disabled' : ''} aria-label="Trang sau" title="Trang sau">${icon('arrow')}</button>
    </nav>`;
}

/** CV preview body for the dialog. Sample text only; no file is stored. */
export function renderCvPreview(candidate) {
  return `<div class="cv-preview">
    <div class="cv-preview-head"><span class="pdf-badge" aria-hidden="true">PDF</span><div><strong>${esc(candidate.cv)}</strong><small>${esc(candidate.name)} · MSSV ${esc(candidate.studentId)}</small></div></div>
    <div class="cv-preview-sheet">
      <p><strong>Ngành học:</strong> ${esc(candidate.major)} (${esc(candidate.year || 'Sinh viên')})</p>
      <p><strong>Vị trí ứng tuyển:</strong> ${esc(candidate.role)} — ${esc(candidate.department)}</p>
      <p><strong>Nguyện vọng tham gia:</strong></p>
      <blockquote>${esc(candidate.sop)}</blockquote>
      <p class="cv-preview-note">Bản xem trước minh họa; prototype không lưu tệp PDF thật.</p>
    </div>
  </div>`;
}

export function renderDetailPanel(candidate, { readOnly = false } = {}) {
  if (!candidate) {
    return `<aside class="detail-panel empty-detail" id="detail-panel" tabindex="-1" aria-label="Chi tiết hồ sơ">
      <div class="empty-state">
        ${icon('info')}
        <h3>Chưa chọn hồ sơ</h3>
        <p>Chọn một ứng viên từ danh sách bên trái để xem thông tin chi tiết và xét duyệt.</p>
      </div>
    </aside>`;
  }

  const isShortlisted = candidate.status === 'shortlisted';
  const isRejected = candidate.status === 'rejected';

  return `<aside class="detail-panel" id="detail-panel" tabindex="-1" aria-label="Chi tiết hồ sơ ${esc(candidate.name)}">
    <div class="detail-top">
      <strong>Chi tiết hồ sơ</strong>
      <div class="detail-top-actions">
        <button type="button" class="button button-quiet button-small mobile-back" data-action="close-detail" aria-label="Quay lại danh sách hồ sơ">${icon('arrow')}Danh sách</button>
        <button type="button" class="icon-button" data-action="close-detail" aria-label="Đóng chi tiết hồ sơ" title="Đóng chi tiết">${icon('x')}</button>
      </div>
    </div>
    <div class="detail-body">
      <div class="profile-header">
        <span class="avatar avatar-large ${esc(candidate.color || 'mint')}">${esc(candidate.initials || 'UV')}</span>
        <div>
          <h2>${esc(candidate.name)}</h2>
          <small>${esc(candidate.studentId)} · ${esc(candidate.year || 'Sinh viên')}</small>
        </div>
      </div>

      <div class="profile-contacts">
        <span>${icon('mail')}${esc(candidate.email)}</span>
        <span>${icon('school')}${esc(candidate.major)}</span>
      </div>

      <section class="detail-section" aria-label="Vị trí ứng tuyển">
        <h3>Vị trí ứng tuyển</h3>
        <div class="applied-role-box">
          <div>
            <strong>${esc(candidate.role)}</strong>
            <small>${esc(candidate.department)}</small>
          </div>
          ${statusBadge(candidate.status)}
        </div>
      </section>

      <section class="detail-section" aria-label="Đôi lời từ ứng viên">
        <h3>Đôi lời từ ứng viên</h3>
        <p class="sop-text">${esc(candidate.sop)}</p>
      </section>

      <section class="detail-section" aria-label="CV đính kèm">
        <h3>CV đính kèm</h3>
        <div class="cv-card">
          <span class="pdf-badge" aria-hidden="true">PDF</span>
          <div class="cv-info">
            <strong>${esc(candidate.cv)}</strong>
            <small>Định dạng PDF · Hồ sơ minh họa</small>
          </div>
          <button type="button" class="button button-secondary button-small" data-action="view-cv" data-app="${esc(candidate.id)}" aria-label="Xem trước CV của ${esc(candidate.name)}">${icon('eye')}Xem CV</button>
        </div>
      </section>

      <section class="detail-section" aria-label="Ghi chú nội bộ">
        <label for="review-note" class="note-label">
          <span>Ghi chú nội bộ</span>
          <small>${icon('lock')}Chỉ ban tuyển dụng</small>
        </label>
        <textarea id="review-note" data-app="${esc(candidate.id)}" rows="3"${readOnly ? ' readonly' : ''} placeholder="Nhận xét sơ bộ, câu hỏi cần trao đổi trong buổi phỏng vấn…">${esc(candidate.note || '')}</textarea>
        <span class="inline-saved" id="note-saved" aria-live="polite"></span>
      </section>

      <div class="submission-time">
        ${icon('clock')}
        <span>Đã nộp: ${esc(formatDateTime(candidate.submitted))}</span>
      </div>
    </div>

    ${readOnly ? `<p class="detail-locked">${icon('lock')}Lịch phỏng vấn đã xác nhận nên quyết định vòng CV chỉ có thể xem.</p>` : `<div class="detail-actions">
      <button type="button" class="button button-danger" data-decision="rejected" data-app="${esc(candidate.id)}" ${isRejected ? 'disabled' : ''}>
        ${icon('x')}${isRejected ? 'Đã loại hồ sơ' : 'Loại hồ sơ'}
      </button>
      <button type="button" class="button button-primary" data-decision="shortlisted" data-app="${esc(candidate.id)}" ${isShortlisted ? 'disabled' : ''}>
        ${icon('check')}${isShortlisted ? 'Đã qua vòng CV' : 'Cho qua vòng CV'}
      </button>
    </div>`}
  </aside>`;
}

export function renderRows(applications, selectedId) {
  if (!applications || applications.length === 0) {
    return '';
  }
  return applications.map(a => {
    const isSelected = a.id === selectedId;
    return `<tr class="${isSelected ? 'selected' : ''}" data-row-app="${esc(a.id)}">
      <td>
        <button type="button" class="select-person-button" data-select="${esc(a.id)}" aria-label="Xem hồ sơ ${esc(a.name)}, ${esc(a.role)}">
          ${personAvatar(a)}
        </button>
      </td>
      <td>
        <span class="role-name">${esc(a.role)}</span>
        <small class="role-sub">${esc(a.department)}</small>
      </td>
      <td><time class="submitted-time" datetime="${esc(a.submitted)}">${esc(formatDateTime(a.submitted))}</time></td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <button type="button" class="row-action-btn" data-select="${esc(a.id)}" aria-label="Mở chi tiết hồ sơ ${esc(a.name)}">
          ${icon('chevron')}
        </button>
      </td>
    </tr>`;
  }).join('');
}

export function renderApplications(applications, campaign = {}, options = {}) {
  const {
    selectedId = applications[0]?.id || null,
    filter = 'all',
    role = 'all',
    query = '',
    sort = 'submitted-desc',
    page = 1,
    readOnly = false,
    intakeStatus = 'open'
  } = options;
  const pageInfo = paginate(applications, { sort, page });
  const [intakeText, intakeClass] = intakeLabels[intakeStatus] || intakeLabels.open;
  const ariaSort = column => sort.startsWith(column) ? ` aria-sort="${sort.endsWith('asc') ? 'ascending' : 'descending'}"` : '';

  const roles = [...new Set(applications.map(a => a.role))];
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;
  const uniqueStudents = new Set(applications.map(a => a.studentId)).size;

  const campaignName = campaign.name || 'Tuyển thành viên mùa Thu 2026';
  const campaignClub = campaign.club || 'CLB Truyền thông HCMUS';
  const campaignClose = campaign.close ? formatDateTime(campaign.close) : '20/11/2026';

  const selectedCandidate = applications.find(a => a.id === selectedId) || applications[0] || null;

  return `<div class="page-heading">
    <div>
      <h1>Duyệt hồ sơ ứng tuyển</h1>
      <p>Những gương mặt mới, những khả năng mới. Cùng xem xét và tìm người đồng hành phù hợp cho câu lạc bộ.</p>
    </div>
    <div class="heading-actions">
      <button type="button" class="button button-secondary" data-action="export-apps">
        ${icon('download')}Xuất danh sách (CSV)
      </button>
    </div>
  </div>

  <div class="campaign-ribbon" role="region" aria-label="Thông tin đợt tuyển">
    <div class="ribbon-main">
      ${icon('calendar')}
      <div>
        <strong>${esc(campaignName)}</strong>
        <small>${esc(campaignClub)}</small>
      </div>
    </div>
    <div class="ribbon-meta">
      <span class="close-date">Hạn nhận đơn: ${esc(campaignClose)}</span>
      <span class="pill pill-${intakeClass}">${intakeText}</span>${readOnly ? '<span class="pill pill-shortlisted">Lịch đã xác nhận</span>' : ''}
    </div>
  </div>

  <div class="stats-strip" role="region" aria-label="Thống kê hồ sơ">
    <div class="stat-card">
      <div class="stat-top"><span class="stat-dot dot-neutral"></span>Tổng hồ sơ</div>
      <span class="stat-value">${applications.length}</span>
      <span class="stat-context">từ ${uniqueStudents} ứng viên</span>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-dot dot-amber"></span>Chờ duyệt</div>
      <span class="stat-value">${pendingCount}</span>
      <span class="stat-context ${pendingCount > 0 ? 'attention' : ''}">${pendingCount > 0 ? 'cần bạn xem xét' : 'đã duyệt hết'}</span>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-dot dot-success"></span>Qua vòng CV</div>
      <span class="stat-value">${shortlistedCount}</span>
      <span class="stat-context">sẵn sàng xếp lịch</span>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-dot dot-danger"></span>Đã loại</div>
      <span class="stat-value">${rejectedCount}</span>
      <span class="stat-context">kết thúc vòng CV</span>
    </div>
  </div>

  <div class="review-layout ${!selectedCandidate ? 'detail-closed' : ''}">
    <section class="list-panel" aria-label="Danh sách hồ sơ ứng tuyển">
      <div class="list-heading">
        <h2>Danh sách hồ sơ</h2>
        <span class="count-tag">${applications.length} hồ sơ</span>
      </div>

      <div class="toolbar">
        <div class="search-field">
          <label class="toolbar-label" for="application-search">Tìm hồ sơ</label>
          ${icon('search')}
          <input id="application-search" type="search" placeholder="Tìm tên, MSSV hoặc mã hồ sơ…" value="${esc(query)}">
        </div>
        <div class="filter-field">
          <label class="toolbar-label" for="sort-select">Sắp xếp</label>
          <select id="sort-select">
            ${Object.entries(sortOptions).map(([key, [label]]) => `<option value="${key}"${sort === key ? ' selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
        <div class="filter-field">
          <label class="toolbar-label" for="role-filter">Vị trí</label>
          <select id="role-filter">
            <option value="all">Tất cả vị trí</option>
            ${roles.map(r => `<option value="${esc(r)}"${role === r ? ' selected' : ''}>${esc(r)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="status-tabs" role="group" aria-label="Lọc theo trạng thái hồ sơ">
        <button type="button" class="status-tab ${filter === 'all' ? 'active' : ''}" data-filter="all" aria-pressed="${filter === 'all'}">
          Tất cả <span class="tab-count">${applications.length}</span>
        </button>
        <button type="button" class="status-tab ${filter === 'pending' ? 'active' : ''}" data-filter="pending" aria-pressed="${filter === 'pending'}">
          Chờ duyệt <span class="tab-count">${pendingCount}</span>
        </button>
        <button type="button" class="status-tab ${filter === 'shortlisted' ? 'active' : ''}" data-filter="shortlisted" aria-pressed="${filter === 'shortlisted'}">
          Qua vòng CV <span class="tab-count">${shortlistedCount}</span>
        </button>
        <button type="button" class="status-tab ${filter === 'rejected' ? 'active' : ''}" data-filter="rejected" aria-pressed="${filter === 'rejected'}">
          Đã loại <span class="tab-count">${rejectedCount}</span>
        </button>
      </div>

      <div class="table-scroll" tabindex="0" role="region" aria-label="Bảng hồ sơ ứng tuyển, có thể cuộn ngang">
        <table class="data-table apps-table">
          <thead>
            <tr>
              <th scope="col" id="th-name"${ariaSort('name')}>Ứng viên</th>
              <th scope="col" id="th-role"${ariaSort('role')}>Vị trí ứng tuyển</th>
              <th scope="col" id="th-submitted"${ariaSort('submitted')}>Thời gian nộp</th>
              <th scope="col">Trạng thái</th>
              <th scope="col"><span class="sr-only">Chi tiết</span></th>
            </tr>
          </thead>
          <tbody id="application-rows">
            ${renderRows(pageInfo.rows, selectedCandidate?.id)}
          </tbody>
        </table>
        <div id="app-empty" class="empty-state" ${applications.length ? 'hidden' : ''}>
          ${icon('search')}
          <h3>Không tìm thấy hồ sơ</h3>
          <p>Thử tìm với từ khóa khác hoặc xóa bộ lọc để xem lại toàn bộ danh sách.</p>
        </div>
      </div>

      <div class="list-footer" id="list-footer">
        ${renderPager(pageInfo)}
      </div>
    </section>

    ${renderDetailPanel(selectedCandidate, { readOnly })}
  </div>

  <div class="review-bottom-nav">
    <div class="review-notice">
      ${icon('lock')}
      <span>Ghi chú và quyết định vòng CV chỉ dành cho ban tuyển dụng nội bộ.</span>
    </div>
    <a class="button button-primary" href="schedule.html">
      Tiếp tục đến lịch phỏng vấn${icon('arrow')}
    </a>
  </div>`;
}
