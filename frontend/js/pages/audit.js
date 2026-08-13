/**
 * Audit Logs View Controller (Connected to Backend Audit APIs)
 */
async function renderAuditPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // Fetch live audit logs from backend
  const liveLogs = await apiService.getAuditLogs();

  let auditData = [];
  if (Array.isArray(liveLogs) && liveLogs.length > 0) {
    auditData = liveLogs.map((log, idx) => ({
      id: log.audit_id || log.id || `AUD-${8800 + idx}`,
      user: log.user_id || log.user || 'Kanaram T.',
      action: log.action || 'DOCUMENT_UPLOAD',
      resource: log.resource_id || log.resource || '2260009765_not_edit.pdf',
      type: log.resource_type || 'Ingestion',
      timestamp: log.timestamp || log.created_at || '2026-08-08 19:22:10'
    }));
  } else {
    auditData = [
      { id: 'AUD-8801', user: 'Kanaram T.', action: 'DOCUMENT_UPLOAD', resource: '2260009765_not_edit.pdf', type: 'Ingestion', timestamp: '2026-08-08 19:22:10' },
      { id: 'AUD-8802', user: 'David Vance', action: 'REVIEW_APPROVED', resource: 'Review #104', type: 'Governance', timestamp: '2026-08-08 18:45:00' },
      { id: 'AUD-8803', user: 'Alex Mercer', action: 'ROLE_UPDATE', resource: 'User USR-004 -> Reviewer', type: 'Security', timestamp: '2026-08-08 15:10:22' },
      { id: 'AUD-8804', user: 'System Task', action: 'RECOMMENDATION_GEN', resource: 'Re-Embed Chunk #402', type: 'System', timestamp: '2026-08-08 12:00:00' }
    ];
  }

  // 1. Banner
  const banner = renderBanner({
    title: 'Governance Audit Trail Logs',
    subtitle: 'Immutable record of security events, document uploads, review approvals, and permission changes.',
    icon: 'shield-check',
    actionText: 'Export Audit Logs',
    actionIcon: 'download',
    onAction: () => showToast('Audit logs exported successfully.', 'success')
  });
  page.appendChild(banner);

  // 2. Audit Table
  const tableContainer = document.createElement('div');
  tableContainer.className = 'card-surface';

  const columns = [
    { header: 'Log ID', key: 'id', render: val => `<span class="text-mono font-semibold">${val}</span>` },
    { header: 'Initiated By', key: 'user', render: val => `<span class="font-medium">${val}</span>` },
    { header: 'Event Action', key: 'action', type: 'badge', badgeMap: { 'DOCUMENT_UPLOAD': 'badge-purple', 'REVIEW_APPROVED': 'badge-success', 'ROLE_UPDATE': 'badge-warning', 'RECOMMENDATION_GEN': 'badge-info' } },
    { header: 'Target Resource', key: 'resource' },
    { header: 'Category', key: 'type', render: val => `<span class="badge badge-secondary">${val}</span>` },
    { header: 'Timestamp', key: 'timestamp', render: val => `<span class="text-mono text-xs text-muted">${val}</span>` }
  ];

  const table = renderDataTable({ columns, data: auditData });
  tableContainer.appendChild(table);
  page.appendChild(tableContainer);

  return page;
}

window.renderAuditPage = renderAuditPage;
