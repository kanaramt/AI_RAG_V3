/**
 * Toast Notifications Manager
 */
function renderToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 120;
      display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info') {
  const container = renderToastContainer();
  const toast = document.createElement('div');
  toast.className = `badge badge-${type === 'error' ? 'danger' : type}`;
  toast.style.cssText = `
    padding: 0.75rem 1.25rem; font-size: 0.85rem; border-radius: var(--radius-md);
    box-shadow: var(--shadow-md); pointer-events: auto; opacity: 0; transform: translateY(-10px);
    transition: all 0.25s ease; background: var(--bg-card); border: 1px solid var(--border-card);
  `;

  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    if (window.lucide) window.lucide.createIcons();
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3500);
}

window.renderToastContainer = renderToastContainer;
window.showToast = showToast;
