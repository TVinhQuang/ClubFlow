/**
 * Owner: Lê Tấn Thành — 24127540
 * Screen 2: Duyệt hồ sơ (Application Review)
 */

import { createApplicationsStore } from './store.js';
import { initialCampaign } from '../campaign/seed.js';
import { renderApplications, renderDetailPanel, renderRows, statusBadge } from './view.js';
import { escapeHtml as esc, icon } from '../../shared/ui.js';

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}

function csvDownload(filename, rows) {
  const csv = '\uFEFF' + rows.map(r => r.map(c => '"' + String(c ?? '').replaceAll('"', '""') + '"').join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mount(container, services) {
  let storage = null;
  try { storage = localStorage; } catch {}

  const store = createApplicationsStore(storage);
  const campaign = services?.campaignStore?.getPublished?.() || initialCampaign;
  const ui = services?.ui;

  let state = {
    applications: store.getAll(),
    selectedId: store.getAll()[0]?.id || null,
    filter: 'all',
    role: 'all',
    query: ''
  };

  function getFiltered() {
    return state.applications.filter(a => {
      const matchFilter = state.filter === 'all' || a.status === state.filter;
      const matchRole = state.role === 'all' || a.role === state.role;
      const haystack = normalize(`${a.name} ${a.studentId} ${a.id} ${a.role} ${a.major}`);
      const needle = normalize(state.query);
      const matchQuery = !needle || haystack.includes(needle);
      return matchFilter && matchRole && matchQuery;
    });
  }

  function renderFull() {
    container.innerHTML = renderApplications(state.applications, campaign, {
      selectedId: state.selectedId,
      filter: state.filter,
      role: state.role,
      query: state.query
    });
  }

  function updateTable() {
    const filtered = getFiltered();
    const rowsEl = container.querySelector('#application-rows');
    const emptyEl = container.querySelector('#app-empty');
    const countEl = container.querySelector('#list-count');

    if (rowsEl) rowsEl.innerHTML = renderRows(filtered, state.selectedId);
    if (emptyEl) emptyEl.hidden = filtered.length > 0;
    if (countEl) countEl.textContent = `Hiển thị ${filtered.length}/${state.applications.length} hồ sơ · Dữ liệu minh họa`;
  }

  function updateStats() {
    const stats = store.getStats();
    const statCards = container.querySelectorAll('.stat-card .stat-value');
    if (statCards.length >= 4) {
      statCards[0].textContent = stats.total;
      statCards[1].textContent = stats.pending;
      statCards[2].textContent = stats.shortlisted;
      statCards[3].textContent = stats.rejected;
    }

    const counts = {
      all: stats.total,
      pending: stats.pending,
      shortlisted: stats.shortlisted,
      rejected: stats.rejected
    };

    for (const [key, val] of Object.entries(counts)) {
      const tab = container.querySelector(`.status-tab[data-filter="${key}"] .tab-count`);
      if (tab) tab.textContent = val;
    }
  }

  function updateDetail() {
    const candidate = state.applications.find(a => a.id === state.selectedId) || null;
    const existing = container.querySelector('#detail-panel');
    const layout = container.querySelector('.review-layout');

    if (layout) {
      layout.classList.toggle('detail-closed', !candidate);
    }

    if (existing) {
      existing.outerHTML = renderDetailPanel(candidate);
    }
  }

  function selectCandidate(id) {
    state.selectedId = id;
    updateTable();
    updateDetail();

    if (window.innerWidth <= 1099) {
      const panel = container.querySelector('#detail-panel');
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      panel?.focus({ preventScroll: true });
    }
  }

  function openCvModal(candidate) {
    if (!candidate || !ui) return;
    ui.openDialog({
      title: `CV Minh họa · ${candidate.name}`,
      body: `
        <div class="cv-modal-body" style="background:var(--subtle);padding:20px;border-radius:8px;border:1px solid var(--line);">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <span class="pdf-badge" style="display:inline-grid;place-items:center;width:40px;height:40px;background:#da1e28;color:#fff;border-radius:6px;font-weight:700;font-size:12px;">PDF</span>
            <div>
              <strong style="font-size:16px;display:block;">${esc(candidate.cv)}</strong>
              <small style="color:var(--muted);">${esc(candidate.name)} · MSSV: ${esc(candidate.studentId)}</small>
            </div>
          </div>
          <div style="background:var(--surface);padding:18px;border-radius:6px;border:1px solid var(--line);font-size:14px;line-height:1.7;">
            <p><strong>Ngành học:</strong> ${esc(candidate.major)} (${esc(candidate.year || 'Sinh viên')})</p>
            <p><strong>Vị trí ứng tuyển:</strong> ${esc(candidate.role)} - ${esc(candidate.department)}</p>
            <p><strong>Nguyện vọng tham gia:</strong></p>
            <p style="color:var(--muted);font-style:italic;">"${esc(candidate.sop)}"</p>
            <hr style="border:0;border-top:1px solid var(--line);margin:14px 0;">
            <p><strong>Kỹ năng & Hoạt động:</strong> Có kinh nghiệm làm việc nhóm, kỹ năng tin học văn phòng, tinh thần trách nhiệm và tích cực tham gia các phong trào sinh viên cấp trường.</p>
          </div>
        </div>
      `,
      actions: `
        <button type="button" class="button button-secondary" data-action="close-dialog">Đóng</button>
      `
    });
  }

  // Initial render
  renderFull();

  // Event handlers
  const clickHandler = (e) => {
    const selectBtn = e.target.closest('[data-select]');
    if (selectBtn) {
      selectCandidate(selectBtn.dataset.select);
      return;
    }

    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) {
      state.filter = filterBtn.dataset.filter;
      container.querySelectorAll('.status-tab').forEach(t => {
        const isActive = t.dataset.filter === state.filter;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-pressed', String(isActive));
      });
      updateTable();
      return;
    }

    const decisionBtn = e.target.closest('[data-decision]');
    if (decisionBtn) {
      const decision = decisionBtn.dataset.decision;
      const id = decisionBtn.dataset.app;
      const updated = store.updateStatus(id, decision);
      state.applications = store.getAll();
      updateStats();
      updateTable();
      updateDetail();

      if (ui) {
        const statusText = decision === 'shortlisted' ? 'cho qua vòng CV' : 'loại';
        ui.toast(`${updated.name}: Đã ${statusText}.`);
      }
      return;
    }

    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      if (action === 'close-detail') {
        state.selectedId = null;
        updateTable();
        updateDetail();
      } else if (action === 'view-cv') {
        const candidate = state.applications.find(a => a.id === actionBtn.dataset.app) || null;
        openCvModal(candidate);
      } else if (action === 'export-apps') {
        const filtered = getFiltered();
        const rows = [
          ['Mã hồ sơ', 'Họ và tên', 'MSSV', 'Ngành học', 'Vị trí', 'Ban', 'Trạng thái', 'Ngày nộp', 'Ghi chú'],
          ...filtered.map(a => [
            a.id, a.name, a.studentId, a.major, a.role, a.department,
            a.status === 'shortlisted' ? 'Qua vòng CV' : a.status === 'rejected' ? 'Đã loại' : 'Chờ duyệt',
            a.submitted, a.note
          ])
        ];
        csvDownload('clubflow-danh-sach-ung-vien.csv', rows);
        ui?.toast('Đã xuất danh sách ứng viên thành công.');
      }
    }
  };

  const inputHandler = (e) => {
    if (e.target.id === 'application-search') {
      state.query = e.target.value;
      updateTable();
    } else if (e.target.id === 'review-note') {
      const id = e.target.dataset.app;
      const val = e.target.value;
      store.updateNote(id, val);
      state.applications = store.getAll();
      const savedEl = container.querySelector('#note-saved');
      if (savedEl) {
        savedEl.innerHTML = `${icon('check')} Đã lưu ghi chú`;
      }
    }
  };

  const changeHandler = (e) => {
    if (e.target.id === 'role-filter') {
      state.role = e.target.value;
      updateTable();
    }
  };

  container.addEventListener('click', clickHandler);
  container.addEventListener('input', inputHandler);
  container.addEventListener('change', changeHandler);

  return () => {
    container.removeEventListener('click', clickHandler);
    container.removeEventListener('input', inputHandler);
    container.removeEventListener('change', changeHandler);
  };
}
