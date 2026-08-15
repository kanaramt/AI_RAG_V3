/**
 * Platform Settings View Controller
 */
import { renderBanner } from '../components/banner.js';
import { showToast } from '../components/toast.js';

export function renderSettingsPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // 1. Banner
  const banner = renderBanner({
    title: 'Platform Infrastructure & RAG Settings',
    subtitle: 'Configure LLM inference models, embedding providers, chunking sizes, and vector retrieval top-k parameters.',
    icon: 'settings',
    actionText: 'Save Settings',
    actionIcon: 'save',
    onAction: () => showToast('Platform settings saved successfully!', 'success')
  });
  page.appendChild(banner);

  // 2. Settings Forms Card
  const formCard = document.createElement('div');
  formCard.className = 'card-surface flex-col gap-4';

  formCard.innerHTML = `
    <div class="card-title">LLM & Embedding Configuration</div>
    <div class="flex-col gap-3" style="max-width: 600px;">
      <div>
        <label class="text-xs font-semibold text-muted">Default LLM Model</label>
        <select id="setting-default-model" class="form-select">
          <option value="mistral:latest" selected>mistral:latest (Ollama Local)</option>
          <option value="llama3:latest">llama3:latest (Ollama Local)</option>
          <option value="qwen2.5:7b">qwen2.5:7b (Ollama Local)</option>
        </select>
      </div>

      <div>
        <label class="text-xs font-semibold text-muted">Embedding Model Provider</label>
        <select id="setting-embed-model" class="form-select">
          <option value="nomic-embed-text" selected>nomic-embed-text (768 dimensions)</option>
          <option value="all-minilm-l6-v2">all-minilm-l6-v2 (384 dimensions)</option>
        </select>
      </div>

      <div>
        <label class="text-xs font-semibold text-muted">Chunking Token Size</label>
        <input type="number" id="setting-chunk-size" class="form-input" value="512">
        <span class="text-xs text-muted">Token overlap is automatically calculated at 10% (51 tokens).</span>
      </div>

      <div>
        <label class="text-xs font-semibold text-muted">Vector Retrieval Top-K Results</label>
        <input type="number" id="setting-top-k" class="form-input" value="5">
      </div>
    </div>

    <div class="card-title" style="margin-top: 1rem;">User Interface & Preferences</div>
    <div class="flex-col gap-3" style="max-width: 600px;">
      <div>
        <label class="text-xs font-semibold text-muted">Theme Palette</label>
        <select class="form-select">
          <option value="dark" selected>Midnight Dark Theme (Purple/Indigo Accent)</option>
        </select>
      </div>

      <div>
        <label class="text-xs font-semibold text-muted">Platform Language</label>
        <select class="form-select">
          <option value="en" selected>English (US)</option>
        </select>
      </div>
    </div>
  `;

  page.appendChild(formCard);

  // 3. Knowledge Base Export Card
  const exportCard = document.createElement('div');
  exportCard.className = 'card-surface flex-col gap-4';

  exportCard.innerHTML = `
    <div class="card-title">Knowledge Base Export</div>
    <p class="text-xs text-muted" style="max-width: 560px; line-height: 1.6; margin: 0;">
      Download all stored documents, chunks, metadata and knowledge base data as a JSON dataset.
    </p>
    <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.25rem;">
      <button id="btn-export-kb" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="download" style="width:15px;height:15px;"></i>
        <span id="btn-export-kb-label">Export Knowledge Base</span>
      </button>
      <span id="export-kb-status" class="text-xs text-muted" style="display:none; align-items:center; gap:0.4rem;">
        <i data-lucide="loader-2" style="width:13px;height:13px; animation: spin 1s linear infinite;"></i>
        Generating export…
      </span>
    </div>
  `;

  // Inject spin keyframe once
  if (!document.getElementById('kb-export-spin-style')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'kb-export-spin-style';
    styleTag.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(styleTag);
  }

  page.appendChild(exportCard);

  // Wire up export button after DOM insertion
  requestAnimationFrame(() => {
    if (window.lucide) window.lucide.createIcons();

    const exportBtn = document.getElementById('btn-export-kb');
    const exportLabel = document.getElementById('btn-export-kb-label');
    const exportStatus = document.getElementById('export-kb-status');

    if (!exportBtn) return;

    exportBtn.addEventListener('click', async () => {
      // Loading state
      exportBtn.disabled = true;
      exportLabel.textContent = 'Exporting…';
      exportStatus.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();

      try {
        const res = await fetch('/api/export/knowledge-base', { method: 'GET' });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(errBody.detail || 'Export failed');
        }

        // Trigger file download
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'knowledge_base.json';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);

        showToast('Knowledge base exported successfully.', 'success');
      } catch (err) {
        console.error('[KB Export]', err);
        showToast(err.message || 'Knowledge base export failed. Please try again.', 'error');
      } finally {
        // Restore button state
        exportBtn.disabled = false;
        exportLabel.textContent = 'Export Knowledge Base';
        exportStatus.style.display = 'none';
      }
    });
  });

  return page;
}
