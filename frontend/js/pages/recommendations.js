/**
 * Recommendation Center View Controller
 */


async function renderRecommendationsPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // 1. Banner
  const banner = renderBanner({
    title: 'Recommendation Center',
    subtitle: 'Automated AI recommendations to re-embed stale vectors, resolve knowledge gaps, and update chunk boundaries.',
    icon: 'sparkles',
    actionText: 'Execute Auto-Fixes',
    actionIcon: 'zap',
    onAction: () => showToast('Executing automated optimization recommendation fixes...', 'success')
  });
  page.appendChild(banner);

  // 2. Recommendation Cards
  const tableContainer = document.createElement('div');
  tableContainer.className = 'card-surface';

  const mockRecs = [
    { id: 'REC-101', category: 'Re-Embed', asset: 'Q3_Financial_Analysis.pdf', priority: 'High', description: 'Embedding vector drift detected (> 15% distance shift). Re-embedding recommended.', status: 'Active' },
    { id: 'REC-102', category: 'Knowledge Gap', asset: 'API_Gateway_Specifications.txt', priority: 'Medium', description: 'Missing technical documentation chunk for OAuth2 token validation flow.', status: 'Active' },
    { id: 'REC-103', category: 'Update Chunk', asset: 'RAG_System_Architecture.pdf', priority: 'Low', description: 'Optimal chunk size reduced to 256 tokens for high-precision retrieval.', status: 'Active' }
  ];

  const columns = [
    { header: 'ID', key: 'id', render: val => `<span class="text-mono font-semibold">${val}</span>` },
    { header: 'Category', key: 'category', type: 'badge', badgeMap: { 'Re-Embed': 'badge-purple', 'Knowledge Gap': 'badge-warning', 'Update Chunk': 'badge-info' } },
    { header: 'Target Asset', key: 'asset', render: val => `<span class="font-medium">${val}</span>` },
    { header: 'Priority', key: 'priority', type: 'badge', badgeMap: { 'High': 'badge-danger', 'Medium': 'badge-warning', 'Low': 'badge-secondary' } },
    { header: 'Actionable Description', key: 'description' },
    { header: 'Status', key: 'status', type: 'badge', badgeMap: { 'Active': 'badge-success' } }
  ];

  const actions = [
    { name: 'resolve', label: 'Resolve & Execute', icon: 'check-circle-2', className: 'btn-primary', onClick: (row) => { showToast(`Resolved recommendation ${row.id}`, 'success'); } }
  ];

  const table = renderDataTable({ columns, data: mockRecs, actions });
  tableContainer.appendChild(table);
  page.appendChild(tableContainer);

  return page;
}

window.renderRecommendationsPage = renderRecommendationsPage;
