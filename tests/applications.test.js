import test from 'node:test';
import assert from 'node:assert/strict';
import { initialApplications } from '../src/features/applications/seed.js';
import { createApplicationsStore } from '../src/features/applications/store.js';
import { renderApplications, renderDetailPanel, renderRows, statusBadge } from '../src/features/applications/view.js';
import { initialCampaign } from '../src/features/campaign/seed.js';

function createMockStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: key => map.get(key) || null,
    setItem: (key, val) => map.set(key, String(val)),
    removeItem: key => map.delete(key),
    clear: () => map.clear()
  };
}

test('initialApplications contains valid candidates and required fields', () => {
  assert.ok(Array.isArray(initialApplications));
  assert.ok(initialApplications.length >= 8);
  for (const app of initialApplications) {
    assert.match(app.id, /^HS-\d+$/);
    assert.ok(app.studentId && app.studentId.length >= 8);
    assert.ok(app.name && app.name.length > 0);
    assert.ok(app.role && app.department);
    assert.ok(['pending', 'shortlisted', 'rejected'].includes(app.status));
    assert.ok(app.sop && app.sop.length >= 20);
    assert.ok(app.cv && app.cv.endsWith('.pdf'));
  }
});

test('applications store manages state and updates status/notes correctly', () => {
  const storage = createMockStorage();
  const store = createApplicationsStore(storage);

  const all = store.getAll();
  assert.equal(all.length, initialApplications.length);

  const stats = store.getStats();
  assert.equal(stats.total, initialApplications.length);
  assert.equal(stats.pending + stats.shortlisted + stats.rejected, stats.total);

  // Update status
  const updated = store.updateStatus('HS-001', 'shortlisted');
  assert.equal(updated.status, 'shortlisted');
  assert.equal(store.getById('HS-001').status, 'shortlisted');

  // Verify persistence
  const store2 = createApplicationsStore(storage);
  assert.equal(store2.getById('HS-001').status, 'shortlisted');

  // Update note
  store2.updateNote('HS-001', 'Đã phỏng vấn sơ bộ');
  assert.equal(store2.getById('HS-001').note, 'Đã phỏng vấn sơ bộ');
});

test('renderApplications produces semantic markup with single h1 and schedule link', () => {
  const html = renderApplications(initialApplications, initialCampaign);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.ok(html.includes('Duyệt hồ sơ ứng tuyển'));
  assert.ok(html.includes('href="schedule.html"'));
  assert.ok(html.includes('id="application-search"'));
  assert.ok(html.includes('id="role-filter"'));
  assert.ok(html.includes('id="application-rows"'));
});

test('renderDetailPanel safely represents candidate data and action buttons', () => {
  const candidate = initialApplications[0];
  const html = renderDetailPanel(candidate);
  assert.ok(html.includes(candidate.name));
  assert.ok(html.includes(candidate.studentId));
  assert.ok(html.includes(candidate.cv));
  assert.ok(html.includes('data-decision="shortlisted"'));
  assert.ok(html.includes('data-decision="rejected"'));
});
