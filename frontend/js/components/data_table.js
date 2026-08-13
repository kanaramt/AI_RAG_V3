/**
 * Data Table Component
 */
function renderDataTable({ columns, data, onRowClick, actions }) {
  const container = document.createElement('div');
  container.className = 'table-container';

  let html = `
    <table class="data-table">
      <thead>
        <tr>
          ${columns.map(col => `<th>${col.header}</th>`).join('')}
          ${actions ? '<th style="text-align: right;">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody>
  `;

  if (!data || data.length === 0) {
    html += `
      <tr>
        <td colspan="${columns.length + (actions ? 1 : 0)}" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No records found.
        </td>
      </tr>
    `;
  } else {
    data.forEach((row, idx) => {
      html += `<tr data-row-idx="${idx}">`;
      columns.forEach(col => {
        const val = row[col.key];
        let renderedVal = val;

        if (col.type === 'badge') {
          const badgeClass = col.badgeMap ? (col.badgeMap[val] || 'badge-info') : 'badge-info';
          renderedVal = `<span class="badge ${badgeClass}">${val}</span>`;
        } else if (col.render) {
          renderedVal = col.render(val, row);
        }

        html += `<td>${renderedVal !== undefined && renderedVal !== null ? renderedVal : '-'}</td>`;
      });

      if (actions) {
        html += `<td style="text-align: right;" class="table-actions">`;
        actions.forEach(act => {
          html += `
            <button class="btn btn-secondary ${act.className || ''}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" data-action="${act.name}">
              ${act.icon ? `<i data-lucide="${act.icon}"></i>` : ''}
              <span>${act.label}</span>
            </button>
          `;
        });
        html += `</td>`;
      }
      html += `</tr>`;
    });
  }

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;

  if (actions) {
    container.querySelectorAll('tr[data-row-idx]').forEach(tr => {
      const idx = tr.getAttribute('data-row-idx');
      const rowData = data[idx];

      tr.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const actionName = btn.getAttribute('data-action');
          const actObj = actions.find(a => a.name === actionName);
          if (actObj && actObj.onClick) {
            actObj.onClick(rowData);
          }
        });
      });
    });
  }

  if (onRowClick) {
    container.querySelectorAll('tbody tr[data-row-idx]').forEach(tr => {
      tr.addEventListener('click', () => {
        const idx = tr.getAttribute('data-row-idx');
        onRowClick(data[idx]);
      });
    });
  }

  return container;
}

window.renderDataTable = renderDataTable;
