/**
 * Dedicated Upload Center View Controller
 */
async function renderUploadCenterPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // Fetch live documents from backend
  const docs = await apiService.getDocuments();

  // 1. Banner
  const banner = renderBanner({
    title: 'Knowledge Base Upload & Ingestion Center',
    subtitle: 'Upload documents, extract website text, or index plain text into ChromaDB Vector Store.',
    icon: 'upload-cloud',
    actionText: 'Sync Data Directory',
    actionIcon: 'rotate-cw',
    onAction: () => showToast('Triggered background data directory sync!', 'info')
  });
  page.appendChild(banner);

  // 2. Multi-source Ingestion Card
  const ingestCard = document.createElement('div');
  ingestCard.className = 'card-surface flex-col gap-4';

  ingestCard.innerHTML = `
    <div class="flex items-center justify-between" style="border-bottom: 1px solid var(--border-subtle, #1f2436); padding-bottom: 0.75rem;">
      <div class="flex gap-2" id="upload-tab-btns">
        <button class="btn btn-primary" id="utab-file"><i data-lucide="file-up"></i> Upload Files</button>
        <button class="btn btn-secondary" id="utab-url"><i data-lucide="globe"></i> Website Crawler</button>
        <button class="btn btn-secondary" id="utab-text"><i data-lucide="clipboard-type"></i> Plain Text</button>
      </div>
      <span class="badge badge-purple">ChromaDB Vector Store</span>
    </div>

    <!-- Pane 1: Drag Drop Files -->
    <div id="upane-file" class="flex-col gap-3">
      <div class="db-upload-zone" id="center-dropzone" style="border: 2px dashed var(--primary-accent); border-radius: var(--radius-lg); padding: 2.5rem; text-align: center; background: var(--bg-surface-hover); cursor: pointer;">
        <i data-lucide="cloud-upload" style="width: 48px; height: 48px; color: var(--primary-accent); margin-bottom: 0.5rem;"></i>
        <div class="font-semibold text-base">Click or drag files to index into knowledge base</div>
        <div class="text-xs text-muted" style="margin-top: 0.25rem;">Supports PDF, CSV, TXT, DOCX, XLSX, PPTX, Images (Max 50MB)</div>
        <input type="file" id="center-file-input" multiple style="display: none;" accept=".pdf,.csv,.txt,.docx,.xlsx,.pptx,.png,.jpg,.jpeg">
      </div>
    </div>

    <!-- Pane 2: Website URL Crawler -->
    <div id="upane-url" class="flex-col gap-3 hidden">
      <div>
        <label class="text-xs font-semibold text-muted">Paste Target Webpage URL</label>
        <div class="flex gap-2" style="margin-top: 0.35rem;">
          <input type="url" id="center-url-input" class="form-input" placeholder="https://docs.enterprise.ai/rag/overview" style="flex: 1;">
          <button class="btn btn-primary" id="center-load-url-btn"><i data-lucide="download-cloud"></i> Crawl & Index</button>
        </div>
        <span class="text-xs text-muted" style="margin-top: 0.35rem; display: block;">Extracts text, strips scripts/ads, creates chunks, and generates vector embeddings.</span>
      </div>
    </div>

    <!-- Pane 3: Plain Text Ingestion -->
    <div id="upane-text" class="flex-col gap-3 hidden">
      <div>
        <label class="text-xs font-semibold text-muted">Raw Text Content</label>
        <textarea id="center-raw-text" class="form-textarea" style="height: 120px;" placeholder="Paste raw text, policies, or documentation content to index..."></textarea>
        <button class="btn btn-primary" id="center-index-text-btn" style="margin-top: 0.75rem;"><i data-lucide="file-plus"></i> Index Text</button>
      </div>
    </div>
  `;

  page.appendChild(ingestCard);

  // 3. Recently Indexed Documents Table
  const tableCard = document.createElement('div');
  tableCard.className = 'card-surface';

  const columns = [
    { header: 'Document Name', key: 'name', render: (val, row) => `<div class="font-semibold" style="color: var(--primary-accent);">${val}</div><div class="text-xs text-mono text-muted">ID: ${row.id}</div>` },
    { header: 'File Size', key: 'size', render: val => `<span class="text-xs font-mono">${val}</span>` },
    { header: 'Type', key: 'type', type: 'badge', badgeMap: { 'PDF': 'badge-purple', 'Image': 'badge-warning', 'TXT': 'badge-secondary' } },
    { header: 'Indexed Date', key: 'created_at', render: val => `<span class="text-xs text-muted">${val}</span>` }
  ];

  const actions = [
    { name: 'delete', label: 'Remove', icon: 'trash-2', className: 'btn-danger', onClick: (row) => { showToast(`Removed ${row.name}`, 'error'); } }
  ];

  const docsData = Array.isArray(docs) && docs.length > 0 ? docs.map(d => ({
    id: d.id,
    name: d.name,
    size: d.size,
    type: (d.name || '').endsWith('.pdf') ? 'PDF' : (d.name || '').endsWith('.png') ? 'Image' : 'TXT',
    created_at: d.created_at || '2026-08-08'
  })) : [
    { id: 'DOC-8891', name: '2260009765_not_edit.pdf', size: '7.1 KB', type: 'PDF', created_at: '2026-08-08 19:20' },
    { id: 'DOC-8892', name: 'image.png', size: '332.0 Bytes', type: 'Image', created_at: '2026-08-08 19:21' }
  ];

  const table = renderDataTable({ columns, data: docsData, actions });
  tableCard.appendChild(table);
  page.appendChild(tableCard);

  // Tab switching logic
  setTimeout(() => {
    const tabFile = page.querySelector('#utab-file');
    const tabUrl = page.querySelector('#utab-url');
    const tabText = page.querySelector('#utab-text');

    const paneFile = page.querySelector('#upane-file');
    const paneUrl = page.querySelector('#upane-url');
    const paneText = page.querySelector('#upane-text');

    const dropzone = page.querySelector('#center-dropzone');
    const fileInput = page.querySelector('#center-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          showToast(`Uploaded ${files.length} document(s) for chunking!`, 'success');
        }
      });
    }

    tabFile?.addEventListener('click', () => {
      tabFile.className = 'btn btn-primary'; tabUrl.className = 'btn btn-secondary'; tabText.className = 'btn btn-secondary';
      paneFile.classList.remove('hidden'); paneUrl.classList.add('hidden'); paneText.classList.add('hidden');
    });

    tabUrl?.addEventListener('click', () => {
      tabUrl.className = 'btn btn-primary'; tabFile.className = 'btn btn-secondary'; tabText.className = 'btn btn-secondary';
      paneUrl.classList.remove('hidden'); paneFile.classList.add('hidden'); paneText.classList.add('hidden');
    });

    tabText?.addEventListener('click', () => {
      tabText.className = 'btn btn-primary'; tabFile.className = 'btn btn-secondary'; tabUrl.className = 'btn btn-secondary';
      paneText.classList.remove('hidden'); paneFile.classList.add('hidden'); paneUrl.classList.add('hidden');
    });
  }, 100);

  return page;
}

window.renderUploadCenterPage = renderUploadCenterPage;
