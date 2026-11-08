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

export function renderDetailPanel(candidate) {
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
        <button type="button" class="icon-button" data-action="close-detail" aria-label="Đóng chi tiết hồ sơ">${icon('x')}</button>
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
        <textarea id="review-note" data-app="${esc(candidate.id)}" rows="3" placeholder="Nhận xét sơ bộ, câu hỏi cần trao đổi trong buổi phỏng vấn…">${esc(candidate.note || '')}</textarea>
        <span class="inline-saved" id="note-saved" aria-live="polite"></span>
      </section>

      <div class="submission-time">
        ${icon('clock')}
        <span>Đã nộp: ${esc(formatDateTime(candidate.submitted))}</span>
      </div>
    </div>

    <div class="detail-actions">
      <button type="button" class="button button-danger" data-decision="rejected" data-app="${esc(candidate.id)}" ${isRejected ? 'disabled' : ''}>
        ${icon('x')}${isRejected ? 'Đã loại hồ sơ' : 'Loại hồ sơ'}
      </button>
      <button type="button" class="button button-primary" data-decision="shortlisted" data-app="${esc(candidate.id)}" ${isShortlisted ? 'disabled' : ''}>
        ${icon('check')}${isShortlisted ? 'Đã qua vòng CV' : 'Cho qua vòng CV'}
      </button>
    </div>
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
    query = ''
  } = options;

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
      <span class="pill pill-published">Đang nhận đơn</span>
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
          <label class="sr-only" for="application-search">Tìm tên, MSSV hoặc mã hồ sơ</label>
          ${icon('search')}
          <input id="application-search" type="search" placeholder="Tìm tên, MSSV hoặc mã hồ sơ…" value="${esc(query)}">
        </div>
        <div class="filter-field">
          <label class="sr-only" for="role-filter">Lọc theo vị trí</label>
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
              <th scope="col">Ứng viên</th>
              <th scope="col">Vị trí ứng tuyển</th>
              <th scope="col">Trạng thái</th>
              <th scope="col"><span class="sr-only">Chi tiết</span></th>
            </tr>
          </thead>
          <tbody id="application-rows">
            ${renderRows(applications, selectedCandidate?.id)}
          </tbody>
        </table>
        <div id="app-empty" class="empty-state" ${applications.length ? 'hidden' : ''}>
          ${icon('search')}
          <h3>Không tìm thấy hồ sơ</h3>
          <p>Thử tìm với từ khóa khác hoặc xóa bộ lọc để xem lại toàn bộ danh sách.</p>
        </div>
      </div>

      <div class="list-footer">
        <span id="list-count">Hiển thị ${applications.length}/${applications.length} hồ sơ · Dữ liệu minh họa</span>
        <div class="pagination">
          <span>Trang</span>
          <span class="page-current">1</span>
          <span>/ 1</span>
        </div>
      </div>
    </section>

    ${renderDetailPanel(selectedCandidate)}
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
