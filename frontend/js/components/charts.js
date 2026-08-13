/**
 * Chart Renderer Helper using Chart.js
 */
function createLineChart(canvasId, labels, data, datasetLabel = 'Growth') {
  const ctx = document.getElementById(canvasId);
  if (!ctx || !window.Chart) return null;

  return new window.Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: datasetLabel,
        data,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#a855f7'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#1f2436' }, ticks: { color: '#64748b' } },
        y: { grid: { color: '#1f2436' }, ticks: { color: '#64748b' } }
      }
    }
  });
}

function createDoughnutChart(canvasId, labels, data, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || !window.Chart) return null;

  return new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors || ['#10b981', '#f59e0b', '#ef4444', '#6366f1'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } }
      },
      cutout: '70%'
    }
  });
}

function createBarChart(canvasId, labels, data, label = 'Metric') {
  const ctx = document.getElementById(canvasId);
  if (!ctx || !window.Chart) return null;

  return new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b' } },
        y: { grid: { color: '#1f2436' }, ticks: { color: '#64748b' } }
      }
    }
  });
}

window.createLineChart = createLineChart;
window.createDoughnutChart = createDoughnutChart;
window.createBarChart = createBarChart;
