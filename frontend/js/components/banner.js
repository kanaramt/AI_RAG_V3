/**
 * Glowing Top Banner Card Component (Reference Design)
 */
function renderBanner({ title, subtitle, icon, actionText, actionIcon, onAction }) {
  const banner = document.createElement('div');
  banner.className = 'glowing-banner';

  banner.innerHTML = `
    <div class="banner-left">
      <div class="banner-icon-badge">
        <i data-lucide="${icon || 'layout'}"></i>
      </div>
      <div>
        <div class="banner-title">${title}</div>
        <div class="banner-subtitle">${subtitle}</div>
      </div>
    </div>
    ${actionText ? `
      <button class="btn btn-primary" id="banner-action-btn">
        <i data-lucide="${actionIcon || 'plus'}"></i>
        <span>${actionText}</span>
      </button>
    ` : ''}
  `;

  if (actionText && onAction) {
    const btn = banner.querySelector('#banner-action-btn');
    if (btn) btn.addEventListener('click', onAction);
  }

  return banner;
}

window.renderBanner = renderBanner;
