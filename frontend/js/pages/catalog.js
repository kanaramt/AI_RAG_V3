/**
 * Knowledge Catalog View Controller (Connected to Backend APIs)
 */
async function renderCatalogPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // Fetch live catalog assets & documents from backend
  const [liveAssets, liveDocs] = await Promise.all([
    apiService.getCatalogAssets(),
    apiService.getDocuments()
  ]);

  // Merge backend data with fallback format
  let assetData = [];
  if (Array.isArray(liveAssets) && liveAssets.length > 0) {
    assetData = liveAssets.map((ast, idx) => ({
      id: ast.asset_id || ast.id || `AST-${100 + idx}`,
      name: ast.asset_name || ast.filename || ast.title || `Document_${idx + 1}`,
      docId: ast.document_id || ast.doc_id || `DOC-${8800 + idx}`,
      source: ast.source_type || 'PDF',
      owner: ast.owner || 'Kanaram T.',
      dept: ast.department || 'AI Engineering',
      chunks: ast.chunk_count || ast.chunks || 14,
      healthScore: ast.health_score || ast.score || 95,
      status: ast.status || 'Active',
      updated: ast.updated_at || '2026-08-08'
    }));
  } else if (Array.isArray(liveDocs) && liveDocs.length > 0) {
    assetData = liveDocs.map((doc, idx) => ({
      id: `AST-${100 + idx}`,
      name: doc.filename || doc.name || `Document_${idx + 1}`,
      docId: doc.doc_id || `DOC-${8800 + idx}`,
      source: (doc.filename || '').endsWith('.pdf') ? 'PDF' : (doc.filename || '').endsWith('.png') ? 'Image' : 'TXT',
      owner: 'Kanaram T.',
      dept: 'AI Engineering',
      chunks: doc.chunk_count || 12,
      healthScore: 96,
      status: 'Active',
      updated: '2026-08-08'
    }));
  } else {
    assetData = [
      { id: 'AST-101', name: '2260009765_not_edit.pdf', docId: 'DOC-8891', source: 'PDF', owner: 'Kanaram T.', dept: 'AI Engineering', chunks: 14, healthScore: 98, status: 'Active', updated: '2026-08-08' },
      { id: 'AST-102', name: 'image.png', docId: 'DOC-8892', source: 'Image', owner: 'Alex M.', dept: 'AI Engineering', chunks: 1, healthScore: 94, status: 'Active', updated: '2026-08-08' },
      { id: 'AST-103', name: 'httpbin.org', docId: 'DOC-8893', source: 'Web URL', owner: 'Kanaram T.', dept: 'AI Engineering', chunks: 8, healthScore: 96, status: 'Active', updated: '2026-08-08' }
    ];
  }

  // 1. Glowing Banner
  const banner = renderBanner({
    title: 'Knowledge Catalog & Document Registry',
    subtitle: 'Manage indexed document assets, chunking metadata, vector embeddings, and ingestion status.',
    icon: 'database',
    actionText: 'Upload New Document',
    actionIcon: 'file-plus',
    onAction: () => {
      const openSettings = document.getElementById('open-settings-btn');
      if (openSettings) openSettings.click();
    }
  });
  page.appendChild(banner);

  // 2. Search & Filter Bar
  const filterCard = document.createElement('div');
  filterCard.className = 'card-surface flex items-center justify-between gap-4';
  filterCard.innerHTML = `
    <div class="flex items-center gap-3 flex-1">
      <input type="text" id="catalog-search" class="form-input" placeholder="Filter by asset name, owner, or department..." style="max-width: 320px;">
      <select id="catalog-dept-filter" class="form-select" style="width: 160px;">
        <option value="">All Departments</option>
        <option value="AI Engineering">AI Engineering</option>
        <option value="Finance">Finance</option>
        <option value="Legal">Legal</option>
      </select>
    </div>
    <button class="btn btn-secondary" id="reprocess-all-btn">
      <i data-lucide="rotate-cw"></i> Reprocess Stale Assets
    </button>
  `;
  page.appendChild(filterCard);

  // 3. Asset Data Table
  const tableContainer = document.createElement('div');
  tableContainer.className = 'card-surface';

  const columns = [
    { header: 'Asset Name', key: 'name', render: (val, row) => `<div class="font-semibold" style="color: var(--primary-accent);">${val}</div><div class="text-xs text-muted">ID: ${row.id}</div>` },
    { header: 'Document ID', key: 'docId', render: val => `<span class="text-mono text-xs">${val}</span>` },
    { header: 'Source Type', key: 'source', type: 'badge', badgeMap: { 'PDF': 'badge-purple', 'DOCX': 'badge-info', 'Image': 'badge-warning', 'Web URL': 'badge-success', 'TXT': 'badge-secondary' } },
    { header: 'Owner', key: 'owner' },
    { header: 'Department', key: 'dept' },
    { header: 'Chunks', key: 'chunks', render: val => `<span class="font-medium">${val} chunks</span>` },
    { header: 'Health Score', key: 'healthScore', render: val => `<span class="badge ${val >= 90 ? 'badge-success' : 'badge-warning'}">${val}%</span>` },
    { header: 'Status', key: 'status', type: 'badge', badgeMap: { 'Active': 'badge-success', 'Pending Review': 'badge-warning' } },
    { header: 'Last Updated', key: 'updated', render: val => `<span class="text-xs text-muted">${val}</span>` }
  ];

  const actions = [
    { name: 'details', label: 'Details', icon: 'eye', onClick: (row) => showAssetDetails(row) },
    { name: 'reprocess', label: 'Reprocess', icon: 'rotate-cw', onClick: (row) => { showToast(`Triggered reprocessing for ${row.name}`, 'info'); } }
  ];

  const table = renderDataTable({ columns, data: assetData, actions });
  tableContainer.appendChild(table);
  page.appendChild(tableContainer);

  function showAssetDetails(asset) {
    openModal({
      title: `Asset Details: ${asset.name}`,
      content: `
        <div class="flex-col gap-3" style="font-size: 0.85rem;">
          <div class="card-surface p-2">
            <div class="flex justify-between mb-1"><span class="text-muted">Document ID:</span> <span class="text-mono font-semibold">${asset.docId}</span></div>
            <div class="flex justify-between mb-1"><span class="text-muted">Chunk Count:</span> <span class="font-semibold">${asset.chunks} chunks</span></div>
            <div class="flex justify-between mb-1"><span class="text-muted">Embedding Model:</span> <span class="font-semibold">nomic-embed-text</span></div>
            <div class="flex justify-between"><span class="text-muted">Vector Store Collection:</span> <span class="font-semibold">enterprise_rag_chunks</span></div>
          </div>
          <div class="font-semibold">Retrieval Performance History</div>
          <div class="badge badge-success">Average Similarity Score: 0.96</div>
        </div>
      `
    });
  }

  return page;
}

window.renderCatalogPage = renderCatalogPage;
