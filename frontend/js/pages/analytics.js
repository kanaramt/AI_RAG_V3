/**
 * Analytics Dashboard View Controller
 */
async function renderAnalyticsPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // 1. Banner
  const banner = renderBanner({
    title: 'Enterprise AI Platform Analytics',
    subtitle: 'Deep-dive metrics on query throughput, vector search performance, quality approval rates, and latency.',
    icon: 'bar-chart-3',
    actionText: 'Export Analytics Report',
    actionIcon: 'download',
    onAction: () => showToast('Analytics report exported as CSV/PDF', 'success')
  });
  page.appendChild(banner);

  // 2. Multi-chart layout
  const grid = document.createElement('div');
  grid.className = 'charts-grid';

  grid.innerHTML = `
    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Daily Query Volume & Throughput</span>
        <span class="badge badge-purple">QPS Peak: 42</span>
      </div>
      <div style="height: 250px; position: relative;">
        <canvas id="analytics-query-chart"></canvas>
      </div>
    </div>

    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">RAG Response Latency Distribution (ms)</span>
        <span class="badge badge-success">Avg: 124ms</span>
      </div>
      <div style="height: 250px; position: relative;">
        <canvas id="analytics-latency-chart"></canvas>
      </div>
    </div>

    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Knowledge Asset Category Breakdown</span>
      </div>
      <div style="height: 250px; position: relative;">
        <canvas id="analytics-source-chart"></canvas>
      </div>
    </div>

    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Governance Review Approval Rate (%)</span>
      </div>
      <div style="height: 250px; position: relative;">
        <canvas id="analytics-approval-chart"></canvas>
      </div>
    </div>
  `;
  page.appendChild(grid);

  setTimeout(() => {
    createLineChart('analytics-query-chart', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [120, 340, 520, 780, 950, 420, 680], 'Queries');
    createBarChart('analytics-latency-chart', ['Vector Search', 'Reranking', 'Prompt Assembly', 'LLM Generation'], [18, 12, 5, 89], 'Latency (ms)');
    createDoughnutChart('analytics-source-chart', ['PDF Documents', 'DOCX Files', 'TXT Code', 'Database Sync'], [55, 25, 12, 8], ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']);
    createLineChart('analytics-approval-chart', ['W1', 'W2', 'W3', 'W4'], [92, 94, 95, 96.4], 'Approval %');
  }, 100);

  return page;
}

window.renderAnalyticsPage = renderAnalyticsPage;
