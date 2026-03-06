/**
 * MetaFan — Dashboard JavaScript
 * Handles CRUD operations, table management, and UI interactions.
 */

const API_URL = 'api.php';

// ─── State ───
let currentView = 'overview';
let currentTable = '';
let tableData = null;
let foreignKeys = {};

// ─── DOM Ready ───
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initMobileMenu();
  loadOverview();
});

// ─── Sidebar Navigation ───
function initSidebar() {
  document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      switchView(view);
    });
  });
}

function switchView(view) {
  currentView = view;
  currentTable = '';

  // Update active link
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar-link[data-view="${view}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Update topbar
  const titles = {
    'overview': 'Panoramica',
    'view': 'Visualizza Dati',
    'add': 'Aggiungi Dati',
    'edit': 'Modifica Dati',
    'delete': 'Elimina Record',
    'drop': 'Elimina Relazione'
  };
  document.getElementById('topbarTitle').textContent = titles[view] || 'Dashboard';

  // Load content
  switch(view) {
    case 'overview': loadOverview(); break;
    case 'view': loadViewData(); break;
    case 'add': loadAddForm(); break;
    case 'edit': loadEditData(); break;
    case 'delete': loadDeleteData(); break;
    case 'drop': loadDropTable(); break;
  }
}

// ─── Mobile Menu ───
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (btn) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
}

// ─── API Helpers ───
async function apiGet(action, params = {}) {
  const url = new URL(API_URL, window.location.href);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const res = await fetch(url);
  if (res.status === 401) {
    window.location.href = 'login.php';
    return null;
  }
  return res.json();
}

async function apiPost(action, data = {}) {
  const formData = new FormData();
  formData.append('action', action);
  
  function appendFormData(fd, obj, prefix = '') {
    for (const [key, val] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}[${key}]` : key;
      if (typeof val === 'object' && val !== null && !(val instanceof File)) {
        appendFormData(fd, val, fieldName);
      } else {
        fd.append(fieldName, val ?? '');
      }
    }
  }
  appendFormData(formData, data);

  const res = await fetch(API_URL, { method: 'POST', body: formData });
  if (res.status === 401) {
    window.location.href = 'login.php';
    return null;
  }
  return res.json();
}

// ─── Toast Notifications ───
function showToast(type, title, message) {
  const container = document.getElementById('toastContainer');
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type]}"></i>
    <div class="toast-message"><strong>${title}</strong>${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Table Selector HTML ───
function renderTableSelector(tables, selected, onChange) {
  return `
    <div class="table-selector">
      <label><i class="fas fa-database"></i>&nbsp; Seleziona tabella:</label>
      <select onchange="${onChange}(this.value)">
        <option value="">— Scegli una tabella —</option>
        ${tables.map(t => `<option value="${t}" ${t === selected ? 'selected' : ''}>${t}</option>`).join('')}
      </select>
    </div>
  `;
}

// ═══════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════
async function loadOverview() {
  const content = document.getElementById('dashboardContent');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const [statsRes, tablesRes] = await Promise.all([
    apiGet('stats'),
    apiGet('tables')
  ]);

  if (!statsRes || !tablesRes) return;

  const stats = statsRes.stats;
  const tables = tablesRes.tables;

  content.innerHTML = `
    <div class="dash-stats">
      <div class="dash-stat-card">
        <div class="dash-stat-icon gold"><i class="fas fa-database"></i></div>
        <div>
          <div class="dash-stat-value">${stats.tables}</div>
          <div class="dash-stat-label">Tabelle</div>
        </div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-icon blue"><i class="fas fa-layer-group"></i></div>
        <div>
          <div class="dash-stat-value">${stats.rows.toLocaleString()}</div>
          <div class="dash-stat-label">Record Totali</div>
        </div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-icon green"><i class="fas fa-server"></i></div>
        <div>
          <div class="dash-stat-value">${stats.database}</div>
          <div class="dash-stat-label">Database</div>
        </div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-icon gold"><i class="fas fa-shield-alt"></i></div>
        <div>
          <div class="dash-stat-value">Attivo</div>
          <div class="dash-stat-label">Stato Sistema</div>
        </div>
      </div>
    </div>

    <div class="dash-panel">
      <div class="dash-panel-header">
        <div class="dash-panel-title"><i class="fas fa-table"></i> Tabelle del Database</div>
      </div>
      <div class="dash-panel-body">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome Tabella</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              ${tables.map(t => `
                <tr>
                  <td><i class="fas fa-table" style="color:var(--gold);margin-right:8px;opacity:.5"></i>${t}</td>
                  <td>
                    <button class="table-action-btn" style="color:var(--gold);background:rgba(201,164,76,.08);border:1px solid rgba(201,164,76,.15);" onclick="switchView('view');setTimeout(()=>selectViewTable('${t}'),100)">
                      <i class="fas fa-eye"></i> Visualizza
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
// VIEW DATA
// ═══════════════════════════════════════════
async function loadViewData() {
  const content = document.getElementById('dashboardContent');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const res = await apiGet('tables');
  if (!res) return;

  content.innerHTML = `
    <div class="dash-panel">
      ${renderTableSelector(res.tables, currentTable, 'selectViewTable')}
      <div id="viewTableContent">
        <div class="empty-state">
          <i class="fas fa-table"></i>
          <h3>Seleziona una tabella</h3>
          <p>Scegli una tabella dal menu per visualizzarne i dati.</p>
        </div>
      </div>
    </div>
  `;
}

async function selectViewTable(table) {
  if (!table) return;
  currentTable = table;
  const container = document.getElementById('viewTableContent');
  container.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const res = await apiGet('data', { table });
  if (!res) return;

  if (res.rows.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>Nessun dato</h3>
        <p>La tabella <strong>${table}</strong> è vuota.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="dash-panel-header" style="border-top:1px solid var(--gold-border)">
      <div class="dash-panel-title">
        <i class="fas fa-table"></i> ${table}
        <span style="font-weight:400;font-size:.8rem;color:var(--text-muted);margin-left:8px">${res.rowCount} record</span>
      </div>
    </div>
    <div class="dash-panel-body">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              ${res.columns.map(c => `<th>${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${res.rows.map(row => `
              <tr>
                ${res.columns.map(c => `<td>${escapeHtml(row[c] ?? '')}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
// ADD DATA
// ═══════════════════════════════════════════
async function loadAddForm() {
  const content = document.getElementById('dashboardContent');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const res = await apiGet('tables');
  if (!res) return;

  content.innerHTML = `
    <div class="dash-panel">
      ${renderTableSelector(res.tables, currentTable, 'selectAddTable')}
      <div id="addFormContent">
        <div class="empty-state">
          <i class="fas fa-plus-circle"></i>
          <h3>Seleziona una tabella</h3>
          <p>Scegli una tabella per inserire nuovi dati.</p>
        </div>
      </div>
    </div>
  `;
}

async function selectAddTable(table) {
  if (!table) return;
  currentTable = table;
  const container = document.getElementById('addFormContent');
  container.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const [colRes, fkRes] = await Promise.all([
    apiGet('columns', { table }),
    apiGet('foreign_keys', { table })
  ]);

  if (!colRes) return;
  foreignKeys = fkRes?.foreign_keys || {};

  const columns = colRes.columns;

  container.innerHTML = `
    <div class="dash-panel-body">
      <form id="addRecordForm" class="dash-form" onsubmit="handleAdd(event)">
        <div class="form-row">
          ${columns.map(col => {
            const fieldName = col.Field;
            const fk = foreignKeys[fieldName];
            if (fk && fk.options) {
              return `
                <div class="form-group">
                  <label class="form-label">${fieldName}</label>
                  <select name="${fieldName}" class="form-select">
                    ${fk.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
                  </select>
                </div>
              `;
            }
            return `
              <div class="form-group">
                <label class="form-label">${fieldName}</label>
                <input type="text" name="${fieldName}" class="form-input" placeholder="Inserisci ${fieldName}">
              </div>
            `;
          }).join('')}
        </div>
        <input type="hidden" name="table" value="${table}">
        <button type="submit" class="btn btn-primary btn-lg"><i class="fas fa-plus"></i> Aggiungi Record</button>
      </form>
    </div>
  `;
}

async function handleAdd(e) {
  e.preventDefault();
  const form = e.target;
  const table = form.querySelector('[name="table"]').value;
  const data = {};

  form.querySelectorAll('.form-input, .form-select').forEach(input => {
    if (input.value !== '') {
      data[input.name] = input.value;
    }
  });

  const res = await apiPost('insert', { table, data });
  if (res && res.success) {
    showToast('success', 'Inserimento riuscito', res.message);
    form.reset();
    form.querySelector('[name="table"]').value = table;
  } else {
    showToast('error', 'Errore', res?.error || 'Errore durante l\'inserimento');
  }
}

// ═══════════════════════════════════════════
// EDIT DATA
// ═══════════════════════════════════════════
async function loadEditData() {
  const content = document.getElementById('dashboardContent');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const res = await apiGet('tables');
  if (!res) return;

  content.innerHTML = `
    <div class="dash-panel">
      ${renderTableSelector(res.tables, currentTable, 'selectEditTable')}
      <div id="editTableContent">
        <div class="empty-state">
          <i class="fas fa-edit"></i>
          <h3>Seleziona una tabella</h3>
          <p>Scegli una tabella per modificarne i dati.</p>
        </div>
      </div>
    </div>
  `;
}

async function selectEditTable(table) {
  if (!table) return;
  currentTable = table;
  const container = document.getElementById('editTableContent');
  container.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const res = await apiGet('data', { table });
  if (!res) return;

  if (res.rows.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>Nessun dato</h3>
        <p>La tabella <strong>${table}</strong> è vuota.</p>
      </div>
    `;
    return;
  }

  tableData = res;

  container.innerHTML = `
    <div class="dash-panel-header" style="border-top:1px solid var(--gold-border)">
      <div class="dash-panel-title">
        <i class="fas fa-edit"></i> Modifica — ${table}
        <span style="font-weight:400;font-size:.8rem;color:var(--text-muted);margin-left:8px">${res.rowCount} record</span>
      </div>
    </div>
    <div class="dash-panel-body">
      <form id="editForm" onsubmit="handleEditAll(event)">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                ${res.columns.map(c => `<th>${c}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${res.rows.map((row, idx) => {
                const pkString = res.primaryKeys.map(pk => row[pk]).join('|');
                return `
                  <tr data-pk="${escapeHtml(pkString)}">
                    ${res.columns.map(c => {
                      const isPK = res.primaryKeys.includes(c);
                      if (isPK) {
                        return `<td><strong>${escapeHtml(row[c] ?? '')}</strong></td>`;
                      }
                      return `<td><input class="edit-input" name="${c}__${pkString}" value="${escapeHtml(row[c] ?? '')}" data-col="${c}" data-pk="${escapeHtml(pkString)}"></td>`;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding:var(--space-4) var(--space-6);border-top:1px solid var(--gold-border);">
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Salva tutte le modifiche</button>
        </div>
      </form>
    </div>
  `;
}

async function handleEditAll(e) {
  e.preventDefault();
  if (!tableData) return;

  const inputs = document.querySelectorAll('#editForm .edit-input');
  const updates = {};

  inputs.forEach(input => {
    const col = input.getAttribute('data-col');
    const pk = input.getAttribute('data-pk');
    if (!updates[pk]) updates[pk] = {};
    updates[pk][col] = input.value;
  });

  let successCount = 0;
  let errorCount = 0;

  for (const [pkString, data] of Object.entries(updates)) {
    const pkValues = pkString.split('|');
    const pk = {};
    tableData.primaryKeys.forEach((pkCol, i) => {
      pk[pkCol] = pkValues[i];
    });

    const res = await apiPost('update', { table: currentTable, pk, data });
    if (res && res.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  if (errorCount === 0) {
    showToast('success', 'Modifiche salvate', `${successCount} record aggiornati correttamente.`);
  } else {
    showToast('warning', 'Attenzione', `${successCount} salvati, ${errorCount} errori.`);
  }
}

// ═══════════════════════════════════════════
// DELETE RECORDS
// ═══════════════════════════════════════════
async function loadDeleteData() {
  const content = document.getElementById('dashboardContent');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const res = await apiGet('tables');
  if (!res) return;

  content.innerHTML = `
    <div class="dash-panel">
      ${renderTableSelector(res.tables, currentTable, 'selectDeleteTable')}
      <div id="deleteTableContent">
        <div class="empty-state">
          <i class="fas fa-trash-alt"></i>
          <h3>Seleziona una tabella</h3>
          <p>Scegli una tabella per eliminare dei record.</p>
        </div>
      </div>
    </div>
  `;
}

async function selectDeleteTable(table) {
  if (!table) return;
  currentTable = table;
  const container = document.getElementById('deleteTableContent');
  container.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const res = await apiGet('data', { table });
  if (!res) return;

  if (res.rows.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>Nessun dato</h3>
        <p>La tabella <strong>${table}</strong> è vuota.</p>
      </div>
    `;
    return;
  }

  tableData = res;

  container.innerHTML = `
    <div class="dash-panel-header" style="border-top:1px solid var(--gold-border)">
      <div class="dash-panel-title">
        <i class="fas fa-trash-alt"></i> Elimina da — ${table}
        <span style="font-weight:400;font-size:.8rem;color:var(--text-muted);margin-left:8px">${res.rowCount} record</span>
      </div>
    </div>
    <div class="dash-panel-body">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              ${res.columns.map(c => `<th>${c}</th>`).join('')}
              <th style="width:100px">Azione</th>
            </tr>
          </thead>
          <tbody id="deleteTableBody">
            ${res.rows.map(row => {
              const pkString = res.primaryKeys.map(pk => row[pk]).join('|');
              return `
                <tr id="row-${escapeAttr(pkString)}">
                  ${res.columns.map(c => `<td>${escapeHtml(row[c] ?? '')}</td>`).join('')}
                  <td>
                    <button class="table-action-btn delete" onclick="confirmDelete('${escapeJs(pkString)}')">
                      <i class="fas fa-trash"></i> Elimina
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function confirmDelete(pkString) {
  const modal = document.getElementById('confirmModal');
  modal.classList.add('active');

  document.getElementById('modalConfirmBtn').onclick = async () => {
    modal.classList.remove('active');

    const pkValues = pkString.split('|');
    const pk = {};
    tableData.primaryKeys.forEach((pkCol, i) => {
      pk[pkCol] = pkValues[i];
    });

    const res = await apiPost('delete', { table: currentTable, pk });
    if (res && res.success) {
      showToast('success', 'Eliminato', res.message);
      const row = document.getElementById(`row-${pkString}`);
      if (row) {
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        row.style.transition = 'all 0.3s ease';
        setTimeout(() => row.remove(), 300);
      }
    } else {
      showToast('error', 'Errore', res?.error || 'Errore durante l\'eliminazione');
    }
  };

  document.getElementById('modalCancelBtn').onclick = () => {
    modal.classList.remove('active');
  };
}

// ═══════════════════════════════════════════
// DROP TABLE
// ═══════════════════════════════════════════
async function loadDropTable() {
  const content = document.getElementById('dashboardContent');
  content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const res = await apiGet('tables');
  if (!res) return;

  content.innerHTML = `
    <div class="dash-panel">
      <div class="dash-panel-header">
        <div class="dash-panel-title"><i class="fas fa-exclamation-triangle" style="color:var(--error)"></i> Elimina Relazione (Tabella)</div>
      </div>
      <div class="dash-panel-body">
        <div style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:var(--radius-lg);padding:var(--space-4) var(--space-5);margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-3)">
          <i class="fas fa-exclamation-triangle" style="color:var(--error);font-size:1.25rem"></i>
          <span style="font-size:.875rem;color:var(--text-secondary)"><strong style="color:var(--error)">Attenzione:</strong> Questa operazione è irreversibile. L'intera tabella e tutti i suoi dati verranno eliminati permanentemente.</span>
        </div>
        <div class="dash-form">
          <div class="form-group">
            <label class="form-label">Seleziona la tabella da eliminare:</label>
            <select id="dropTableSelect" class="form-select">
              <option value="">— Scegli una tabella —</option>
              ${res.tables.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-danger btn-lg" onclick="confirmDrop()" style="max-width:260px">
            <i class="fas fa-trash-alt"></i> Elimina Tabella
          </button>
        </div>
      </div>
    </div>
  `;
}

function confirmDrop() {
  const table = document.getElementById('dropTableSelect').value;
  if (!table) {
    showToast('warning', 'Attenzione', 'Seleziona una tabella da eliminare.');
    return;
  }

  const modal = document.getElementById('confirmModal');
  document.querySelector('#confirmModal .modal h3').textContent = 'Eliminare questa tabella?';
  document.querySelector('#confirmModal .modal p').textContent = 
    `Stai per eliminare permanentemente la tabella "${table}" e tutti i suoi dati. Questa azione non può essere annullata.`;
  modal.classList.add('active');

  document.getElementById('modalConfirmBtn').onclick = async () => {
    modal.classList.remove('active');

    const res = await apiPost('drop', { table });
    if (res && res.success) {
      showToast('success', 'Tabella eliminata', res.message);
      loadDropTable(); // Reload
    } else {
      showToast('error', 'Errore', res?.error || 'Errore durante l\'eliminazione');
    }
  };

  document.getElementById('modalCancelBtn').onclick = () => {
    modal.classList.remove('active');
  };
}

// ─── Utilities ───
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeJs(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}
