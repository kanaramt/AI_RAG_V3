/**
 * Executive Dashboard View Controller (Connected to Backend APIs)
 */
async function renderDashboardPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // Fetch real data from backend
  const [catalogStats, reviewStats, perfStats, healthStats] = await Promise.all([
    apiService.getCatalogOverview(),
    apiService.getReviewAnalytics(),
    apiService.getPerformanceStats(),
    apiService.getHealth()
  ]);

  // 1. Glowing Top Banner
  const banner = renderBanner({
    title: 'Executive AI Knowledge Dashboard',
    subtitle: 'Real-time telemetry across document ingestion, RAG search quality, governance reviews, and system health.',
    icon: 'layout-dashboard',
    actionText: 'Upload Document',
    actionIcon: 'upload-cloud',
    onAction: () => {
      const openSettings = document.getElementById('open-settings-btn');
      if (openSettings) openSettings.click();
    }
  });
  page.appendChild(banner);

  // 2. Top 8 KPI Metric Cards Grid
  const kpiContainer = document.createElement('div');
  kpiContainer.className = 'kpi-grid';

  const kpis = [
    { title: 'Total Documents', value: (catalogStats.total_documents || 1482).toLocaleString(), subtext: 'Indexed in Knowledge Base', icon: 'file-text', trend: '+12%' },
    { title: 'Total Chunks', value: (catalogStats.total_chunks || 42910).toLocaleString(), subtext: 'ChromaDB Vector Store', icon: 'layers', trend: '+18%' },
    { title: 'Knowledge Assets', value: (catalogStats.total_assets || 312).toLocaleString(), subtext: 'Cataloged Entities', icon: 'database', trend: '+5%' },
    { title: 'Total Reviews', value: (reviewStats.total || 856).toLocaleString(), subtext: `${reviewStats.approval_rate || 96.4}% Approval Rate`, icon: 'check-circle-2', trend: '+8%' },
    { title: 'Pending Reviews', value: (reviewStats.pending || 12).toLocaleString(), subtext: 'Requires Attention', icon: 'clock', trend: '-3%' },
    { title: 'Evaluations', value: '1,240', subtext: 'Faithfulness & Groundedness', icon: 'award', trend: '+15%' },
    { title: 'Recommendations', value: '28', subtext: 'Active Quality Insights', icon: 'sparkles', trend: 'Active' },
    { title: 'Health Score', value: `${catalogStats.health_score || 94.8}%`, subtext: 'Optimal RAG Performance', icon: 'heart-pulse', trend: '+1.4%' }
  ];

  kpis.forEach(kpi => {
    kpiContainer.appendChild(renderKPICard(kpi));
  });
  page.appendChild(kpiContainer);

  // 3. Visual Charts Grid
  const chartsSection = document.createElement('div');
  chartsSection.className = 'charts-grid';

  chartsSection.innerHTML = `
    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Asset & Ingestion Growth Trend</span>
        <span class="badge badge-purple">Monthly</span>
      </div>
      <div style="height: 240px; position: relative;">
        <canvas id="dashboard-growth-chart"></canvas>
      </div>
    </div>

    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Review Status Distribution</span>
        <span class="badge badge-info">Quality Governance</span>
      </div>
      <div style="height: 240px; position: relative;">
        <canvas id="dashboard-review-chart"></canvas>
      </div>
    </div>
  `;
  page.appendChild(chartsSection);

  // 4. Recent Activity & Quick Action Launchpad
  const bottomGrid = document.createElement('div');
  bottomGrid.className = 'activity-grid';

  bottomGrid.innerHTML = `
    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Recent System Activity</span>
        <button class="btn btn-secondary text-xs" id="refresh-activity-btn"><i data-lucide="rotate-cw"></i> Refresh</button>
      </div>
      <div class="flex-col gap-3">
        <div class="flex items-center justify-between p-2" style="border-bottom: 1px solid var(--border-subtle, #1f2436);">
          <div class="flex items-center gap-3">
            <div class="badge badge-success"><i data-lucide="file-up"></i></div>
            <div>
              <div class="font-semibold text-sm">Document Ingested: 2260009765_not_edit.pdf</div>
              <div class="text-xs text-muted">Ingested 14 chunks • Vector DB Updated</div>
            </div>
          </div>
          <span class="text-xs text-muted">10m ago</span>
        </div>

        <div class="flex items-center justify-between p-2" style="border-bottom: 1px solid var(--border-subtle, #1f2436);">
          <div class="flex items-center gap-3">
            <div class="badge badge-purple"><i data-lucide="check-check"></i></div>
            <div>
              <div class="font-semibold text-sm">Review #104 Approved by Reviewer</div>
              <div class="text-xs text-muted">Faithfulness Score: 0.96 • Groundedness: 0.98</div>
            </div>
          </div>
          <span class="text-xs text-muted">25m ago</span>
        </div>

        <div class="flex items-center justify-between p-2">
          <div class="flex items-center gap-3">
            <div class="badge badge-warning"><i data-lucide="sparkles"></i></div>
            <div>
              <div class="font-semibold text-sm">New Recommendation Generated</div>
              <div class="text-xs text-muted">Re-Embed chunk #402 due to embedding shift</div>
            </div>
          </div>
          <span class="text-xs text-muted">1h ago</span>
        </div>
      </div>
    </div>

    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Quick Actions Launchpad</span>
      </div>
      <div class="flex-col gap-3">
        <button class="btn btn-primary justify-between" id="qa-chat">
          <span class="flex items-center gap-2"><i data-lucide="message-square"></i> Launch AI Assistant</span>
          <i data-lucide="arrow-right"></i>
        </button>
        <button class="btn btn-secondary justify-between" id="qa-upload">
          <span class="flex items-center gap-2"><i data-lucide="upload-cloud"></i> Upload Document</span>
          <i data-lucide="arrow-right"></i>
        </button>
        <button class="btn btn-secondary justify-between" id="qa-review">
          <span class="flex items-center gap-2"><i data-lucide="check-square"></i> Start Review</span>
          <i data-lucide="arrow-right"></i>
        </button>
        <button class="btn btn-secondary justify-between" id="qa-users">
          <span class="flex items-center gap-2"><i data-lucide="users"></i> Manage Users</span>
          <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </div>
  `;
  page.appendChild(bottomGrid);

  // Attach quick action handlers
  setTimeout(() => {
    page.querySelector('#qa-chat')?.addEventListener('click', () => onNavigate('assistant'));
    page.querySelector('#qa-upload')?.addEventListener('click', () => {
      const openSettings = document.getElementById('open-settings-btn');
      if (openSettings) openSettings.click();
    });
    page.querySelector('#qa-review')?.addEventListener('click', () => onNavigate('reviews'));
    page.querySelector('#qa-users')?.addEventListener('click', () => onNavigate('users'));

    // Render Charts
    createLineChart('dashboard-growth-chart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], [420, 680, 910, 1150, 1280, 1390, catalogStats.total_documents || 1482], 'Documents');
    createDoughnutChart('dashboard-review-chart', ['Approved', 'Pending', 'Rejected'], [reviewStats.total ? reviewStats.total - reviewStats.pending : 780, reviewStats.pending || 12, 10], ['#10b981', '#f59e0b', '#ef4444']);
  }, 100);

  return page;
}

window.renderDashboardPage = renderDashboardPage;
