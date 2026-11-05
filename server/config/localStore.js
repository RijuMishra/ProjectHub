const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
const storeFile = path.join(dataDir, 'localStore.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let store = {
  users: [],
  projects: [],
  joinRequests: [],
  resources: [],
  tasks: [],
  comments: [],
  notifications: []
};

// Load existing store if present
const loadStore = () => {
  if (fs.existsSync(storeFile)) {
    try {
      const content = fs.readFileSync(storeFile, 'utf8');
      store = JSON.parse(content);
    } catch (e) {
      console.warn('[LocalStore] Could not parse localStore.json, starting fresh.');
    }
  }
};

const saveStore = () => {
  try {
    fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('[LocalStore] Failed to save store file:', e.message);
  }
};

loadStore();

const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.floor(Math.random() * 1e16).toString(16).padStart(16, '0');
  return timestamp + random;
};

// Helper to deep clone object and add virtuals/helpers
const wrapDoc = (collectionName, doc) => {
  if (!doc) return null;
  const clone = JSON.parse(JSON.stringify(doc));
  if (clone._id) {
    clone.id = clone._id.toString();
  }

  // comparePassword method for User
  if (collectionName === 'users') {
    clone.comparePassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  // save method
  clone.save = async function () {
    const list = store[collectionName];
    const idx = list.findIndex(item => item._id === this._id);
    if (idx !== -1) {
      list[idx] = { ...this };
      saveStore();
    }
    return wrapDoc(collectionName, this);
  };

  // deleteOne method
  clone.deleteOne = async function () {
    store[collectionName] = store[collectionName].filter(item => item._id !== this._id);
    saveStore();
    return { acknowledged: true, deletedCount: 1 };
  };

  return clone;
};

// Populate helper
const populateField = (doc, field, selectStr) => {
  if (!doc) return doc;
  const parts = field.split('.');

  if (parts.length === 1) {
    const targetId = doc[field] && (doc[field]._id || doc[field]);
    if (!targetId) return doc;

    // Search users first (most references are users)
    let ref = store.users.find(u => u._id === targetId.toString());
    if (!ref) {
      ref = store.projects.find(p => p._id === targetId.toString());
    }

    if (ref) {
      const copy = { ...ref };
      delete copy.password;
      if (selectStr) {
        const allowed = selectStr.split(' ').map(s => s.replace('-', '')).filter(Boolean);
        const filtered = { _id: copy._id };
        allowed.forEach(k => {
          if (copy[k] !== undefined) filtered[k] = copy[k];
        });
        doc[field] = filtered;
      } else {
        doc[field] = copy;
      }
    }
  } else if (parts[0] === 'members' && parts[1] === 'user') {
    if (Array.isArray(doc.members)) {
      doc.members = doc.members.map(m => {
        const userId = m.user && (m.user._id || m.user);
        const u = store.users.find(usr => usr._id === (userId ? userId.toString() : ''));
        if (u) {
          const uCopy = { ...u };
          delete uCopy.password;
          return { ...m, user: uCopy };
        }
        return m;
      });
    }
  }
  return doc;
};

// Create Query Builder supporting chainable .populate(), .sort(), .limit(), .select()
class QueryBuilder {
  constructor(collectionName, docs, isSingle = false) {
    this.collectionName = collectionName;
    this.docs = docs.map(d => wrapDoc(collectionName, d));
    this.populates = [];
    this.sortOption = null;
    this.limitCount = null;
    this.selectFields = null;
    this.isSingle = isSingle;
  }

  populate(field, selectStr) {
    this.populates.push({ field, selectStr });
    return this;
  }

  sort(option) {
    this.sortOption = option;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  async exec() {
    let results = [...this.docs];

    // Sorting
    if (this.sortOption) {
      const sortKey = Object.keys(this.sortOption)[0];
      const sortDir = this.sortOption[sortKey];
      results.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (typeof valA === 'string' && valA.match(/^\d{4}-\d{2}-\d{2}/)) {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (valA < valB) return sortDir === 1 ? -1 : 1;
        if (valA > valB) return sortDir === 1 ? 1 : -1;
        return 0;
      });
    }

    // Limiting
    if (this.limitCount !== null) {
      results = results.slice(0, this.limitCount);
    }

    // Populating
    this.populates.forEach(({ field, selectStr }) => {
      results.forEach(doc => {
        populateField(doc, field, selectStr);
      });
    });

    // Selecting (removing password by default unless specified)
    results = results.map(doc => {
      if (this.collectionName === 'users') {
        if (!this.selectFields || !this.selectFields.includes('+password')) {
          delete doc.password;
        }
      }
      return doc;
    });

    if (this.isSingle) {
      return results[0] || null;
    }

    return results;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

// Model Mock Factory
const createModelMock = (collectionName) => {
  return {
    async create(data) {
      if (Array.isArray(data)) {
        return Promise.all(data.map(item => this.create(item)));
      }
      const now = new Date().toISOString();
      const sanitized = { ...data };
      ['owner', 'applicant', 'uploader', 'createdBy', 'assignedTo', 'project', 'recipient', 'sender', 'author'].forEach(f => {
        if (sanitized[f] && typeof sanitized[f] === 'object') {
          sanitized[f] = (sanitized[f]._id || sanitized[f].id || sanitized[f]).toString();
        } else if (sanitized[f] !== undefined && sanitized[f] !== null) {
          sanitized[f] = sanitized[f].toString();
        }
      });

      const newDoc = {
        _id: generateId(),
        ...sanitized,
        createdAt: now,
        updatedAt: now
      };

      // Hash password if user
      if (collectionName === 'users' && newDoc.password) {
        const salt = await bcrypt.genSalt(10);
        newDoc.password = await bcrypt.hash(newDoc.password, salt);
      }

      store[collectionName].push(newDoc);
      saveStore();
      return wrapDoc(collectionName, newDoc);
    },

    find(query = {}) {
      let filtered = store[collectionName].filter(item => {
        for (const [key, value] of Object.entries(query)) {
          if (key === '$or' && Array.isArray(value)) {
            const matchesOr = value.some(subQuery => {
              return Object.entries(subQuery).every(([subKey, subVal]) => {
                const itemVal = item[subKey];
                if (subVal instanceof RegExp) {
                  return subVal.test(Array.isArray(itemVal) ? itemVal.join(' ') : String(itemVal || ''));
                }
                return String(itemVal) === String(subVal);
              });
            });
            if (!matchesOr) return false;
            continue;
          }

          if (key === 'project' && value && value.$in) {
            const strIds = value.$in.map(v => v.toString());
            const itemProj = item.project && (item.project._id || item.project);
            if (!strIds.includes(String(itemProj))) return false;
            continue;
          }

          if (key === 'members.user') {
            const isMember = Array.isArray(item.members) && item.members.some(m => {
              const uId = m.user && (m.user._id || m.user);
              return String(uId) === String(value);
            });
            if (!isMember) return false;
            continue;
          }

          if (key === 'owner' && value && value.$ne) {
            if (String(item.owner) === String(value.$ne)) return false;
            continue;
          }

          // Exact or regex match
          const itemVal = item[key];
          if (value instanceof RegExp) {
            if (!value.test(String(itemVal || ''))) return false;
          } else if (value !== undefined) {
            if (String(itemVal) !== String(value)) return false;
          }
        }
        return true;
      });

      return new QueryBuilder(collectionName, filtered);
    },

    findById(id) {
      if (!id) return new QueryBuilder(collectionName, [], true);
      const targetId = id.toString();
      const item = store[collectionName].find(d => d._id === targetId);
      return new QueryBuilder(collectionName, item ? [item] : [], true);
    },

    findOne(query = {}) {
      return {
        select(fields) {
          this.selectFields = fields;
          return this;
        },
        populate(field, selectStr) {
          this.populates = this.populates || [];
          this.populates.push({ field, selectStr });
          return this;
        },
        async exec() {
          const items = await createModelMock(collectionName).find(query);
          if (!items || items.length === 0) return null;
          let doc = items[0];
          if (this.populates) {
            this.populates.forEach(({ field, selectStr }) => {
              populateField(doc, field, selectStr);
            });
          }
          if (collectionName === 'users' && this.selectFields && this.selectFields.includes('+password')) {
            const raw = store.users.find(u => u._id === doc._id);
            if (raw) doc.password = raw.password;
          }
          return doc;
        },
        then(resolve, reject) {
          return this.exec().then(resolve, reject);
        }
      };
    },

    async findByIdAndUpdate(id, update, options = {}) {
      const targetId = id.toString();
      const idx = store[collectionName].findIndex(d => d._id === targetId);
      if (idx === -1) return null;

      const current = store[collectionName][idx];
      const updated = { ...current, ...update, updatedAt: new Date().toISOString() };
      store[collectionName][idx] = updated;
      saveStore();
      return wrapDoc(collectionName, updated);
    },

    async findByIdAndDelete(id) {
      const targetId = id.toString();
      const item = store[collectionName].find(d => d._id === targetId);
      store[collectionName] = store[collectionName].filter(d => d._id !== targetId);
      saveStore();
      return item ? wrapDoc(collectionName, item) : null;
    },

    async countDocuments(query = {}) {
      const items = await this.find(query);
      return items.length;
    },

    async deleteMany(query = {}) {
      let count = 0;
      store[collectionName] = store[collectionName].filter(item => {
        let match = true;
        for (const [key, value] of Object.entries(query)) {
          if (key === 'project' && value && value.$in) {
            const strIds = value.$in.map(v => v.toString());
            const itemProj = item.project && (item.project._id || item.project);
            if (!strIds.includes(String(itemProj))) match = false;
          } else if (String(item[key]) !== String(value)) {
            match = false;
          }
        }
        if (match) {
          count++;
          return false;
        }
        return true;
      });
      saveStore();
      return { acknowledged: true, deletedCount: count };
    },

    async updateMany(query = {}, update = {}) {
      let count = 0;
      const setFields = update.$set || update;
      store[collectionName].forEach(item => {
        let match = true;
        for (const [key, value] of Object.entries(query)) {
          if (String(item[key]) !== String(value)) {
            match = false;
          }
        }
        if (match) {
          Object.assign(item, setFields, { updatedAt: new Date().toISOString() });
          count++;
        }
      });
      saveStore();
      return { acknowledged: true, modifiedCount: count };
    },

    async aggregate(pipeline = []) {
      // Grouping implementation for categoryStats
      let docs = store[collectionName];
      for (const stage of pipeline) {
        if (stage.$group) {
          const groupKey = stage.$group._id.replace('$', '');
          const grouped = {};
          docs.forEach(doc => {
            const keyVal = doc[groupKey] || 'Other';
            grouped[keyVal] = (grouped[keyVal] || 0) + 1;
          });
          docs = Object.entries(grouped).map(([k, v]) => ({ _id: k, count: v }));
        }
        if (stage.$sort) {
          const sortKey = Object.keys(stage.$sort)[0];
          const dir = stage.$sort[sortKey];
          docs.sort((a, b) => (dir === 1 ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
        }
      }
      return docs;
    }
  };
};

module.exports = {
  createModelMock,
  getStore: () => store,
  saveStore
};
