/**
 * Main Application Bootstrapper & SPA Router (With Restored Feature Integration)
 */
import { store } from './state.js';
import { renderSidebar } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { renderChatWidget } from './components/chat_widget.js';
import { renderConfigDrawer } from './components/config_drawer.js';

import { renderDashboardPage } from './pages/dashboard.js';
import { renderAssistantPage } from './pages/assistant.js';
import { renderCatalogPage } from './pages/catalog.js';
import { renderReviewsPage } from './pages/reviews.js';
import { renderEvaluationPage } from './pages/evaluation.js';
import { renderRecommendationsPage } from './pages/recommendations.js';
import { renderAnalyticsPage } from './pages/analytics.js';
import { renderUsersPage } from './pages/users.js';
import { renderHealthPage } from './pages/health.js';
import { renderAuditPage } from './pages/audit.js';
import { renderSettingsPage } from './pages/settings.js';

class Application {
  constructor() {
    this.root = document.getElementById('app');
    this.configDrawer = null;
    this.init();
  }

  init() {
    // Subscribe to state changes
    store.subscribe((state) => {
      this.render(state);
    });

    // Initial render
    this.render(store.getState());
  }

  navigate(route) {
    store.setState({ currentRoute: route });
  }

  changeRole(newRole) {
    store.setState({ userRole: newRole });
  }

  toggleConfigDrawer() {
    if (this.configDrawer) {
      this.configDrawer.classList.toggle('open');
    }
  }

  render(state) {
    if (!this.root) return;

    this.root.innerHTML = '';

    // 1. Sidebar Component
    const sidebar = renderSidebar(state.currentRoute, state.userRole, (route) => this.navigate(route));
    this.root.appendChild(sidebar);

    // 2. Main Viewport
    const main = document.createElement('main');
    main.className = 'app-main';

    // Top Header Component (With RAG Config Drawer Toggle)
    const header = renderHeader(
      state,
      (newRole) => this.changeRole(newRole),
      () => this.toggleConfigDrawer()
    );
    main.appendChild(header);

    // Dynamic Page Content Router Viewport
    const content = document.createElement('div');
    content.className = 'app-content';

    let pageElement;
    switch (state.currentRoute) {
      case 'dashboard':
        pageElement = renderDashboardPage(state, (r) => this.navigate(r));
        break;
      case 'assistant':
        pageElement = renderAssistantPage(state, (r) => this.navigate(r));
        break;
      case 'catalog':
        pageElement = renderCatalogPage(state, (r) => this.navigate(r));
        break;
      case 'reviews':
        pageElement = renderReviewsPage(state, (r) => this.navigate(r));
        break;
      case 'evaluation':
        pageElement = renderEvaluationPage(state, (r) => this.navigate(r));
        break;
      case 'recommendations':
        pageElement = renderRecommendationsPage(state, (r) => this.navigate(r));
        break;
      case 'analytics':
        pageElement = renderAnalyticsPage(state, (r) => this.navigate(r));
        break;
      case 'users':
        pageElement = renderUsersPage(state, (r) => this.navigate(r));
        break;
      case 'health':
        pageElement = renderHealthPage(state, (r) => this.navigate(r));
        break;
      case 'audit':
        pageElement = renderAuditPage(state, (r) => this.navigate(r));
        break;
      case 'settings':
        pageElement = renderSettingsPage(state, (r) => this.navigate(r));
        break;
      default:
        pageElement = renderDashboardPage(state, (r) => this.navigate(r));
        break;
    }

    content.appendChild(pageElement);
    main.appendChild(content);
    this.root.appendChild(main);

    // 3. Mount RAG Config Drawer
    this.configDrawer = renderConfigDrawer();
    this.root.appendChild(this.configDrawer);

    // 4. Floating Bottom-Right Chat Launcher Widget
    const chatWidget = renderChatWidget(() => this.navigate('assistant'));
    this.root.appendChild(chatWidget);

    // Refresh Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new Application();
});
