/**
 * Top Application Header Component with Document Count, RAG Controls & RBAC Switcher
 */
import { ROLES } from '../rbac.js';

export function renderHeader(state, onRoleChange, onToggleConfig) {
  const header = document.createElement('header');
  header.className = 'app-header';

  header.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="search-wrapper" style="position: relative; width: 320px;">
        <i data-lucide="search" style="position: absolute; left: 10px; top: 9px; color: var(--text-muted); width: 16px; height: 16px;"></i>
        <input type="text" id="global-search-input" class="form-input" style="padding-left: 34px; height: 34px; font-size: 0.82rem;" placeholder="Search platform knowledge, assets, or query history... (Ctrl+K)">
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- Document Index Count Badge -->
      <div class="badge badge-purple flex items-center gap-1.5" title="Indexed Documents in Vector Store">
        <i data-lucide="database" style="width: 14px; height: 14px;"></i>
        <span id="db-document-count">3 Documents Indexed</span>
      </div>

      <!-- System Health Indicator Badge -->
      <div class="badge badge-success flex items-center gap-1.5" title="System Services Operational">
        <span class="health-indicator-dot online"></span>
        <span>Healthy</span>
      </div>

      <!-- Performance View Link Button -->
      <button id="view-performance-btn" class="toolbar-action-btn" title="View Performance Telemetry" onclick="window.open('/performance', '_blank')">
        <i data-lucide="external-link" style="width: 15px; height: 15px;"></i>
      </button>

      <!-- RAG Config Drawer Toggle Button -->
      <button id="toggle-config-btn" class="toolbar-action-btn" title="Toggle RAG Configuration Drawer">
        <i data-lucide="sliders-horizontal" style="width: 15px; height: 15px;"></i>
      </button>

      <!-- RBAC Role Selector Dropdown -->
      <div class="role-selector-container flex items-center gap-2">
        <span class="text-xs text-muted font-medium">Role:</span>
        <select id="role-selector" class="form-select" style="height: 32px; padding: 0 0.5rem; font-size: 0.8rem; width: 150px; background: var(--bg-surface-hover);">
          ${Object.values(ROLES).map(role => `
            <option value="${role}" ${state.userRole === role ? 'selected' : ''}>${role}</option>
          `).join('')}
        </select>
      </div>

      <!-- User Profile Widget -->
      <div class="user-profile-widget flex items-center gap-2" style="border-left: 1px solid var(--border-subtle); padding-left: 0.75rem;">
        <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff;">
          KT
        </div>
        <div class="flex-col text-xs" style="line-height: 1.2;">
          <span class="font-semibold" style="color: var(--text-primary);">${state.userName}</span>
          <span style="color: var(--text-muted);">${state.userRole}</span>
        </div>
      </div>
    </div>
  `;

  // Attach role switcher event
  const roleSelect = header.querySelector('#role-selector');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      onRoleChange(e.target.value);
    });
  }

  // Attach config drawer toggle
  const configBtn = header.querySelector('#toggle-config-btn');
  if (configBtn && onToggleConfig) {
    configBtn.addEventListener('click', () => {
      onToggleConfig();
    });
  }

  return header;
}
