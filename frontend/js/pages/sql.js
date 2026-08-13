/**
 * SQL Database Editor View Controller (Executes live SQL queries on SQLite enterprise_rag.db)
 */
async function renderSQLEditorPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // 1. Banner
  const banner = renderBanner({
    title: 'SQL Database Query & Schema Editor',
    subtitle: 'Execute live SQL queries on SQLite database (enterprise_rag.db) to inspect raw tables and indexes.',
    icon: 'database',
    actionText: 'Execute SQL Query',
    actionIcon: 'play',
    onAction: () => runQuery()
  });
  page.appendChild(banner);

  // 2. Query Editor Box & Quick Presets
  const editorCard = document.createElement('div');
  editorCard.className = 'card-surface flex-col gap-3';

  editorCard.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="font-semibold text-sm flex items-center gap-2">
        <i data-lucide="terminal" style="color: var(--primary-accent);"></i> SQL Query Console
      </div>
      <div class="flex gap-2 text-xs">
        <span class="text-muted">Quick Presets:</span>
        <button class="btn btn-secondary text-xs" style="padding: 2px 8px;" id="preset-assets">Assets</button>
        <button class="btn btn-secondary text-xs" style="padding: 2px 8px;" id="preset-reviews">Reviews</button>
        <button class="btn btn-secondary text-xs" style="padding: 2px 8px;" id="preset-recs">Recommendations</button>
        <button class="btn btn-secondary text-xs" style="padding: 2px 8px;" id="preset-tables">Tables</button>
      </div>
    </div>

    <textarea id="sql-query-input" class="form-textarea text-mono" style="height: 100px; font-size: 0.85rem; background: var(--bg-canvas);" placeholder="SELECT * FROM knowledge_assets LIMIT 10;">SELECT * FROM knowledge_assets LIMIT 10;</textarea>

    <div class="flex items-center justify-between">
      <span class="text-xs text-muted">Supports SELECT, INSERT, UPDATE, PRAGMA queries.</span>
      <button class="btn btn-primary" id="run-sql-btn">
        <i data-lucide="play"></i> Run Query
      </button>
    </div>
  `;
  page.appendChild(editorCard);

  // 3. Results Container Card
  const resultsCard = document.createElement('div');
  resultsCard.className = 'card-surface';
  resultsCard.id = 'sql-results-container';

  resultsCard.innerHTML = `
    <div class="card-header">
      <span class="card-title">Query Output Results</span>
      <span class="badge badge-purple" id="sql-rows-count">0 Rows Returned</span>
    </div>
    <div id="sql-results-viewport" class="table-container" style="max-height: 400px; overflow-y: auto;">
      <div class="text-center p-4 text-muted">Click "Run Query" to execute SQL query.</div>
    </div>
  `;
  page.appendChild(resultsCard);

  async function runQuery() {
    const input = page.querySelector('#sql-query-input');
    const viewport = page.querySelector('#sql-results-viewport');
    const rowsBadge = page.querySelector('#sql-rows-count');
    const query = input ? input.value.trim() : '';

    if (!query) {
      showToast('Please enter an SQL query.', 'warning');
      return;
    }

    viewport.innerHTML = '<div class="text-center p-4 text-muted">Executing query on enterprise_rag.db...</div>';

    const res = await apiService.executeSQL(query);

    if (!res.success) {
      viewport.innerHTML = `<div class="card-surface p-3" style="border-left: 3px solid var(--status-danger); color: var(--status-danger);">Error executing SQL: ${res.error}</div>`;
      rowsBadge.textContent = 'Error';
      showToast('SQL Execution Error', 'error');
      return;
    }

    rowsBadge.textContent = `${res.count} Rows Returned`;
    showToast(`Query executed successfully! (${res.count} rows)`, 'success');

    if (!res.columns || res.columns.length === 0 || !res.rows || res.rows.length === 0) {
      viewport.innerHTML = '<div class="text-center p-4 text-muted">Query completed (0 rows returned).</div>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            ${res.columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    res.rows.forEach(row => {
      html += `<tr>`;
      res.columns.forEach(col => {
        const val = row[col];
        html += `<td class="text-mono text-xs">${val !== null && val !== undefined ? String(val) : '<span class="text-muted">NULL</span>'}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    viewport.innerHTML = html;
  }

  setTimeout(() => {
    page.querySelector('#run-sql-btn')?.addEventListener('click', runQuery);

    page.querySelector('#preset-assets')?.addEventListener('click', () => {
      page.querySelector('#sql-query-input').value = 'SELECT * FROM knowledge_assets LIMIT 10;';
      runQuery();
    });

    page.querySelector('#preset-reviews')?.addEventListener('click', () => {
      page.querySelector('#sql-query-input').value = 'SELECT * FROM knowledge_reviews LIMIT 10;';
      runQuery();
    });

    page.querySelector('#preset-recs')?.addEventListener('click', () => {
      page.querySelector('#sql-query-input').value = 'SELECT * FROM recommendations LIMIT 10;';
      runQuery();
    });

    page.querySelector('#preset-tables')?.addEventListener('click', () => {
      page.querySelector('#sql-query-input').value = "SELECT name, type FROM sqlite_master WHERE type='table';";
      runQuery();
    });

    // Run initial query
    runQuery();
  }, 100);

  return page;
}

window.renderSQLEditorPage = renderSQLEditorPage;
