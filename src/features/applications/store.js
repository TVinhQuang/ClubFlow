import { initialApplications } from './seed.js';

const STORAGE_KEY = 'clubflow.pa2.applications.v1';

export function createApplicationsStore(storage) {
  let inMemory = null;

  function load() {
    if (inMemory) return inMemory;
    if (storage) {
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            inMemory = parsed;
            return inMemory;
          }
        }
      } catch {}
    }
    inMemory = JSON.parse(JSON.stringify(initialApplications));
    return inMemory;
  }

  function persist(data) {
    inMemory = data;
    if (storage) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {}
    }
  }

  return {
    getAll() {
      return [...load()];
    },
    getById(id) {
      return load().find(a => a.id === id) || null;
    },
    updateStatus(id, status) {
      const list = load().map(a => a.id === id ? { ...a, status } : a);
      persist(list);
      return list.find(a => a.id === id);
    },
    updateNote(id, note) {
      const list = load().map(a => a.id === id ? { ...a, note } : a);
      persist(list);
      return list.find(a => a.id === id);
    },
    /** Existing application from the same student for the same position, if any. */
    findDuplicate(studentId, positionId) {
      return load().find(a => a.studentId === studentId && a.positionId === positionId) || null;
    },
    /** Adds an applicant's submission as a pending application; duplicates return the existing record. */
    create(input) {
      const existing = this.findDuplicate(input.studentId, input.positionId);
      if (existing) return { ok: false, duplicate: existing };
      const list = load();
      const next = Math.max(0, ...list.map(a => Number(String(a.id).replace(/\D/g, '')) || 0)) + 1;
      const application = { ...input, id: `HS-${String(next).padStart(3, '0')}`, status: 'pending', note: '' };
      persist([...list, application]);
      return { ok: true, application };
    },
    getStats() {
      const list = load();
      const uniqueStudents = new Set(list.map(a => a.studentId)).size;
      return {
        total: list.length,
        pending: list.filter(a => a.status === 'pending').length,
        shortlisted: list.filter(a => a.status === 'shortlisted').length,
        rejected: list.filter(a => a.status === 'rejected').length,
        uniqueStudents
      };
    },
    reset() {
      persist(JSON.parse(JSON.stringify(initialApplications)));
      return this.getAll();
    }
  };
}
