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

  return page;
}
