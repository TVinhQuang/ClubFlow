/**
 * Owner: Lê Tấn Thành — 24127540
 * Screen 2: Duyệt hồ sơ (Application Review)
 * 2026-11-09 (Nguyễn Thái Cường + Claude Code, pending Thành's review): sorting, real pagination,
 * submission-time column, live intake status, shared stores and read-only mode after schedule confirmation.
 */

import { createApplicationsStore } from './store.js';
import { initialCampaign } from '../campaign/seed.js';
import { getIntakeStatus } from '../campaign/model.js';
import { renderApplications, renderDetailPanel, renderRows, renderPager, renderCvPreview, paginate, sortOptions } from './view.js';
import { icon, downloadCsv } from '../../shared/ui.js';

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}

export function mount(container, services) {
  let storage = null;
  try { storage = localStorage; } catch {}

  const store = services?.applicationsStore || createApplicationsStore(storage);
  const published = services?.campaignStore?.getPublished?.() || null;
  const campaign = published || initialCampaign;
  const ui = services?.ui;
  const readOnly = Boolean(services?.scheduleStore?.isConfirmed?.());
  const intakeStatus = getIntakeStatus(campaign, { published: Boolean(published) });

  let state = {
    applications: store.getAll(),
    selectedId: null,
    filter: 'all',
    role: 'all',
    query: '',
    sort: 'submitted-desc',
    page: 1
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
    const first = paginate(state.applications, { sort: state.sort }).rows[0];
    state.selectedId = state.selectedId || first?.id || null;
    container.innerHTML = renderApplications(state.applications, campaign, {
      selectedId: state.selectedId,
      filter: state.filter,
      role: state.role,
      query: state.query,
      sort: state.sort,
      page: state.page,
      readOnly,
      intakeStatus
    });
  }

  function updateTable() {
    const filtered = getFiltered();
    const info = paginate(filtered, { sort: state.sort, page: state.page });
    state.page = info.page;
    const rowsEl = container.querySelector('#application-rows');
    const emptyEl = container.querySelector('#app-empty');
    const footer = container.querySelector('#list-footer');
    if (rowsEl) rowsEl.innerHTML = renderRows(info.rows, state.selectedId);
    if (emptyEl) emptyEl.hidden = filtered.length > 0;
    if (footer) footer.innerHTML = renderPager(info);
    const column = state.sort.split('-')[0];
    const direction = state.sort.endsWith('asc') ? 'ascending' : 'descending';
    for (const [key, id] of [['name', 'th-name'], ['role', 'th-role'], ['submitted', 'th-submitted']]) {
      const th = container.querySelector(`#${id}`);
      if (!th) continue;
      if (key === column) th.setAttribute('aria-sort', direction); else th.removeAttribute('aria-sort');
    }
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
    const counts = { all: stats.total, pending: stats.pending, shortlisted: stats.shortlisted, rejected: stats.rejected };
    for (const [key, val] of Object.entries(counts)) {
      const tab = container.querySelector(`.status-tab[data-filter="${key}"] .tab-count`);
      if (tab) tab.textContent = val;
    }
  }

  function updateDetail() {
    const candidate = state.applications.find(a => a.id === state.selectedId) || null;
    const existing = container.querySelector('#detail-panel');
    const layout = container.querySelector('.review-layout');
    if (layout) layout.classList.toggle('detail-closed', !candidate);
    if (existing) existing.outerHTML = renderDetailPanel(candidate, { readOnly });
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
      title: `CV minh họa · ${candidate.name}`,
      body: renderCvPreview(candidate),
      actions: '<button type="button" class="button button-secondary" data-action="close-dialog">Đóng</button>'
    });
  }

  renderFull();

  const clickHandler = (e) => {
    const selectBtn = e.target.closest('[data-select]');
    if (selectBtn) { selectCandidate(selectBtn.dataset.select); return; }
    // Pointer convenience: clicking anywhere on a row opens it (the row's buttons remain the keyboard path).
    const row = e.target.closest('tr[data-row-app]');
    if (row && !e.target.closest('a, button, input, select, textarea')) { selectCandidate(row.dataset.rowApp); return; }

    const pageBtn = e.target.closest('[data-page]');
    if (pageBtn && !pageBtn.disabled) {
      const forward = Number(pageBtn.dataset.page) > state.page;
      state.page = Number(pageBtn.dataset.page);
      updateTable();
      const buttons = container.querySelectorAll('#list-footer [data-page]');
      const same = buttons[forward ? 1 : 0];
      (same && !same.disabled ? same : container.querySelector('#list-footer [data-page]:not([disabled])'))?.focus();
      return;
    }

    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) {
      state.filter = filterBtn.dataset.filter;
      state.page = 1;
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
      if (readOnly) return;
      const decision = decisionBtn.dataset.decision;
      const updated = store.updateStatus(decisionBtn.dataset.app, decision);
      state.applications = store.getAll();
      updateStats();
      updateTable();
      updateDetail();
      container.querySelector(`[data-decision="${decision}"]`)?.focus();
      ui?.toast(`${updated.name}: Đã ${decision === 'shortlisted' ? 'cho qua vòng CV' : 'loại'}.`);
      return;
    }

    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      if (action === 'close-detail') {
        const id = state.selectedId;
        state.selectedId = null;
        updateTable();
        updateDetail();
        container.querySelector(`[data-select="${id}"]`)?.focus();
      } else if (action === 'view-cv') {
        openCvModal(state.applications.find(a => a.id === actionBtn.dataset.app) || null);
      } else if (action === 'export-apps') {
        const ordered = [...getFiltered()].sort(sortOptions[state.sort][1]);
        const rows = [
          ['Mã hồ sơ', 'Họ và tên', 'MSSV', 'Ngành học', 'Vị trí', 'Ban', 'Trạng thái', 'Ngày nộp', 'Ghi chú nội bộ'],
          ...ordered.map(a => [
            a.id, a.name, a.studentId, a.major, a.role, a.department,
            a.status === 'shortlisted' ? 'Qua vòng CV' : a.status === 'rejected' ? 'Đã loại' : 'Chờ duyệt',
            a.submitted, a.note
          ])
        ];
        downloadCsv('clubflow-danh-sach-ung-vien.csv', rows);
        ui?.toast(`Đã xuất ${rows.length - 1} hồ sơ theo bộ lọc hiện tại.`);
      }
    }
  };

  const inputHandler = (e) => {
    if (e.target.id === 'application-search') {
      state.query = e.target.value;
      state.page = 1;
      updateTable();
    } else if (e.target.id === 'review-note' && !readOnly) {
      store.updateNote(e.target.dataset.app, e.target.value);
      state.applications = store.getAll();
      const savedEl = container.querySelector('#note-saved');
      if (savedEl) savedEl.innerHTML = `${icon('check')} Đã lưu ghi chú`;
    }
  };

  const changeHandler = (e) => {
    if (e.target.id === 'role-filter') { state.role = e.target.value; state.page = 1; updateTable(); }
    if (e.target.id === 'sort-select') { state.sort = e.target.value; state.page = 1; updateTable(); }
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
