/**
 * RAG Configuration Drawer Component (Restores Top-K, Similarity Threshold, Temperature Parameters)
 */
import { showToast } from './toast.js';

export function renderConfigDrawer(onClose) {
  const drawer = document.createElement('aside');
  drawer.className = 'config-drawer';
  drawer.id = 'config-drawer';

  drawer.innerHTML = `
    <div class="config-header">
      <div class="flex items-center gap-2">
        <i data-lucide="sliders-horizontal" style="color: var(--primary-accent);"></i>
        <span class="font-semibold text-base">RAG Configuration</span>
      </div>
      <button id="close-config-drawer-btn" class="icon-btn text-muted"><i data-lucide="x"></i></button>
    </div>

    <div class="config-content">
      <!-- Top-K Parameter Control -->
      <div class="parameter-control card-surface">
        <div class="parameter-label">
          <span>Top-K Chunks</span>
          <span id="val-top-k" class="parameter-val">4</span>
        </div>
        <input type="range" id="param-top-k" min="1" max="10" value="4" class="slider">
        <span class="text-xs text-muted">Number of vector database document segments to retrieve per query.</span>
      </div>

      <!-- Similarity Threshold Control -->
      <div class="parameter-control card-surface">
        <div class="parameter-label">
          <span>Similarity Threshold</span>
          <span id="val-similarity" class="parameter-val">0.75</span>
        </div>
        <input type="range" id="param-similarity" min="0.50" max="0.95" step="0.05" value="0.75" class="slider">
        <span class="text-xs text-muted">Minimum cosine similarity score required for chunk inclusion.</span>
      </div>

      <!-- Temperature Parameter Control -->
      <div class="parameter-control card-surface">
        <div class="parameter-label">
          <span>LLM Temperature</span>
          <span id="val-temperature" class="parameter-val">0.20</span>
        </div>
        <input type="range" id="param-temperature" min="0.0" max="1.0" step="0.05" value="0.20" class="slider">
        <span class="text-xs text-muted">Lower values increase factual deterministic precision.</span>
      </div>

      <!-- Save RAG Configuration -->
      <button id="save-config-btn" class="btn btn-primary" style="margin-top: 1rem;">
        <i data-lucide="check"></i> Apply RAG Parameters
      </button>
    </div>
  `;

  // Attach slider event listeners
  setTimeout(() => {
    const topKSlider = drawer.querySelector('#param-top-k');
    const topKVal = drawer.querySelector('#val-top-k');
    if (topKSlider && topKVal) {
      topKSlider.addEventListener('input', (e) => { topKVal.textContent = e.target.value; });
    }

    const simSlider = drawer.querySelector('#param-similarity');
    const simVal = drawer.querySelector('#val-similarity');
    if (simSlider && simVal) {
      simSlider.addEventListener('input', (e) => { simVal.textContent = e.target.value; });
    }

    const tempSlider = drawer.querySelector('#param-temperature');
    const tempVal = drawer.querySelector('#val-temperature');
    if (tempSlider && tempVal) {
      tempSlider.addEventListener('input', (e) => { tempVal.textContent = parseFloat(e.target.value).toFixed(2); });
    }

    drawer.querySelector('#close-config-drawer-btn')?.addEventListener('click', () => {
      drawer.classList.remove('open');
      if (onClose) onClose();
    });

    drawer.querySelector('#save-config-btn')?.addEventListener('click', () => {
      showToast('Applied RAG parameters to hybrid search pipeline.', 'success');
      drawer.classList.remove('open');
    });
  }, 100);

  return drawer;
}
