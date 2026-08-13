/**
 * Evaluation Center View Controller
 */

async function renderEvaluationPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // 1. Banner
  const banner = renderBanner({
    title: 'RAG Evaluation Center',
    subtitle: 'Quantitative assessment of AI accuracy, groundedness, hallucination rates, and citation fidelity.',
    icon: 'award',
    actionText: 'Run Evaluation Suite',
    actionIcon: 'play',
    onAction: () => showToast('Triggered full DeepEval RAG evaluation suite execution.', 'info')
  });
  page.appendChild(banner);

  // 2. Metric Score Cards Grid
  const grid = document.createElement('div');
  grid.className = 'kpi-grid';

  const evalMetrics = [
    { title: 'Faithfulness Score', value: '0.96', subtext: '96% Factually Accurate', icon: 'check-circle-2', trend: '+1.2%' },
    { title: 'Groundedness', value: '0.98', subtext: 'Strict Context Match', icon: 'shield-check', trend: '+0.5%' },
    { title: 'Relevance Score', value: '0.94', subtext: 'Query Intent Fit', icon: 'target', trend: '+2.0%' },
    { title: 'Correctness', value: '0.95', subtext: 'Ground Truth Match', icon: 'award', trend: '+1.8%' },
    { title: 'Citation Accuracy', value: '0.99', subtext: 'Exact Source Mapping', icon: 'file-text', trend: '+0.2%' },
    { title: 'Retrieval Score', value: '0.92', subtext: 'Top-K Precision', icon: 'layers', trend: '+3.1%' },
    { title: 'Hallucination Score', value: '0.02', subtext: '2% Risk Rate (Ultra Low)', icon: 'alert-triangle', trend: '-1.4%' }
  ];

  evalMetrics.forEach(m => grid.appendChild(renderKPICard(m)));
  page.appendChild(grid);

  // 3. Visual Charts Section
  const charts = document.createElement('div');
  charts.className = 'charts-grid';

  charts.innerHTML = `
    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Evaluation Score Trends Over Time</span>
        <span class="badge badge-purple">DeepEval Metrics</span>
      </div>
      <div style="height: 250px; position: relative;">
        <canvas id="eval-trend-chart"></canvas>
      </div>
    </div>

    <div class="card-surface">
      <div class="card-header">
        <span class="card-title">Top Quality & Groundedness Issues</span>
        <span class="badge badge-warning">Action Needed</span>
      </div>
      <div class="flex-col gap-3">
        <div class="card-surface p-2" style="border-left: 3px solid var(--status-warning);">
          <div class="font-semibold text-sm">Low Relevance in Multi-turn Context (#312)</div>
          <div class="text-xs text-muted">Retrieval Top-K missed secondary document chunk in legal domain</div>
        </div>
        <div class="card-surface p-2" style="border-left: 3px solid var(--status-danger);">
          <div class="font-semibold text-sm">Potential Citation Drift on Stale Asset (#108)</div>
          <div class="text-xs text-muted">Asset updated in source database, vector index requires re-embedding</div>
        </div>
      </div>
    </div>
  `;
  page.appendChild(charts);

  setTimeout(() => {
    createLineChart('eval-trend-chart', ['Week 1', 'Week 2', 'Week 3', 'Week 4'], [0.88, 0.91, 0.94, 0.96], 'Faithfulness Score');
  }, 100);

  return page;
}

window.renderEvaluationPage = renderEvaluationPage;
