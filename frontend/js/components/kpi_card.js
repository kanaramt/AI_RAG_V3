/**
 * Executive KPI Metric Card Component
 */
function renderKPICard({ title, value, subtext, icon, trend, status }) {
  const card = document.createElement('div');
  card.className = 'kpi-card';

  card.innerHTML = `
    <div class="kpi-top">
      <span class="kpi-label">${title}</span>
      <div class="kpi-icon-wrapper">
        <i data-lucide="${icon || 'activity'}"></i>
      </div>
    </div>
    <div class="kpi-value">${value}</div>
    <div class="kpi-subtext flex items-center justify-between">
      <span>${subtext || ''}</span>
      ${trend ? `<span class="badge ${trend.startsWith('+') ? 'badge-success' : 'badge-warning'}">${trend}</span>` : ''}
    </div>
  `;

  return card;
}

window.renderKPICard = renderKPICard;
