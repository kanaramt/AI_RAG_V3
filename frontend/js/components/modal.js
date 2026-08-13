/**
 * Universal Modal & Dialog Component
 */
function openModal({ title, content, footerButtons, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(13, 15, 23, 0.8);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; opacity: 0; transition: opacity 0.2s ease;
  `;

  const container = document.createElement('div');
  container.className = 'modal-container card-surface';
  container.style.cssText = `
    width: 600px; max-width: 90vw; max-height: 85vh;
    display: flex; flex-direction: column; gap: 1rem;
    box-shadow: var(--shadow-lg); border-color: var(--border-focus);
  `;

  container.innerHTML = `
    <div class="card-header" style="margin-bottom: 0;">
      <span class="card-title">${title}</span>
      <button class="icon-btn text-muted" id="modal-close-btn"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body" style="flex: 1; overflow-y: auto;">
      ${typeof content === 'string' ? content : ''}
    </div>
    ${footerButtons ? `
      <div class="modal-footer flex items-center justify-end gap-2" style="border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
        ${footerButtons.map((btn, i) => `
          <button class="btn ${btn.className || 'btn-secondary'}" id="modal-btn-${i}">
            ${btn.label}
          </button>
        `).join('')}
      </div>
    ` : ''}
  `;

  if (typeof content !== 'string' && content instanceof HTMLElement) {
    container.querySelector('.modal-body').appendChild(content);
  }

  overlay.appendChild(container);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    if (window.lucide) window.lucide.createIcons();
  });

  const close = () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (onClose) onClose();
    }, 200);
  };

  container.querySelector('#modal-close-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  if (footerButtons) {
    footerButtons.forEach((btn, i) => {
      const el = container.querySelector(`#modal-btn-${i}`);
      if (el) {
        el.addEventListener('click', () => {
          if (btn.onClick) btn.onClick(close);
          else close();
        });
      }
    });
  }

  return { close };
}

window.openModal = openModal;
