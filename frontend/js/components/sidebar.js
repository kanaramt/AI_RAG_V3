/**
 * Left Sidebar Navigation Component matching Reference Design
 */
import { canAccessRoute } from '../rbac.js';

export function renderSidebar(currentRoute, userRole, onNavigate) {
  const navItems = [
    { group: 'Main', items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'assistant', label: 'AI Assistant', icon: 'message-square' }
    ]},
    { group: 'Knowledge', items: [
      { id: 'catalog', label: 'Knowledge Catalog', icon: 'database' }
    ]},
    { group: 'Governance', items: [
      { id: 'reviews', label: 'Reviews', icon: 'check-square' },
      { id: 'evaluation', label: 'Evaluations', icon: 'award' },
      { id: 'recommendations', label: 'Recommendations', icon: 'sparkles' }
    ]},
    { group: 'Analytics', items: [
      { id: 'analytics', label: 'Analytics', icon: 'bar-chart-3' }
    ]},
    { group: 'Administration', items: [
      { id: 'users', label: 'Users & RBAC', icon: 'users' },
      { id: 'health', label: 'System Health', icon: 'activity' },
      { id: 'audit', label: 'Audit Logs', icon: 'shield-check' }
    ]},
    { group: 'System', items: [
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]}
  ];

  let html = `
    <div class="org-section">
      <div class="org-badge">
        <div class="org-icon">AG</div>
        <div class="org-text">
          <div class="org-label">ORGANIZATION</div>
          <div class="org-name" title="T kanaram's Organization">T kanaram's Orga...</div>
        </div>
      </div>
      <button id="sidebar-collapse-btn" class="icon-btn text-muted" title="Toggle Sidebar">
        <i data-lucide="chevrons-left"></i>
      </button>
    </div>
    
    <div class="nav-scroll">
  `;

  navItems.forEach(group => {
    const accessibleItems = group.items.filter(item => canAccessRoute(userRole, item.id));
    if (accessibleItems.length > 0) {
      html += `<div class="nav-group-title">${group.group}</div>`;
      accessibleItems.forEach(item => {
        const isActive = currentRoute === item.id;
        html += `
          <div class="nav-item ${isActive ? 'active' : ''}" data-route="${item.id}">
            <i data-lucide="${item.icon}"></i>
            <span class="nav-item-text">${item.label}</span>
          </div>
        `;
      });
    }
  });

  html += `
    </div>
    <div class="sidebar-footer">
      <div class="nav-item" data-route="settings">
        <i data-lucide="help-circle"></i>
        <span class="nav-item-text">Help & Docs</span>
      </div>
      <div class="nav-item">
        <i data-lucide="moon"></i>
        <span class="nav-item-text">Dark Mode Active</span>
      </div>
    </div>
  `;

  const container = document.createElement('aside');
  container.className = 'app-sidebar';
  container.innerHTML = html;

  // Add event listeners
  container.querySelectorAll('.nav-item[data-route]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const route = el.getAttribute('data-route');
      if (route) onNavigate(route);
    });
  });

  const collapseBtn = container.querySelector('#sidebar-collapse-btn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      container.classList.toggle('collapsed');
    });
  }

  return container;
}
