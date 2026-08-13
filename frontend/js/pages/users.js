/**
 * User Management & RBAC View Controller
 */
async function renderUsersPage(state, onNavigate) {
  const page = document.createElement('div');
  page.className = 'flex-col gap-6';

  // 1. Banner
  const banner = renderBanner({
    title: 'User Management & Role-Based Access Control',
    subtitle: 'Manage platform user accounts, security roles, permissions, and session access policies.',
    icon: 'users',
    actionText: 'Create New User',
    actionIcon: 'user-plus',
    onAction: () => handleCreateUserModal()
  });
  page.appendChild(banner);

  // 2. Users Table
  const tableContainer = document.createElement('div');
  tableContainer.className = 'card-surface';

  const mockUsers = [
    { id: 'USR-001', name: 'Kanaram T.', email: 'kanaram@enterprise.ai', dept: 'AI Engineering', role: ROLES.SUPER_ADMIN, status: 'Active', lastLogin: '2026-08-08 19:30' },
    { id: 'USR-002', name: 'Alex Mercer', email: 'alex@enterprise.ai', dept: 'AI Engineering', role: ROLES.ADMINISTRATOR, status: 'Active', lastLogin: '2026-08-08 16:15' },
    { id: 'USR-003', name: 'Sarah Connor', email: 'sarah@enterprise.ai', dept: 'Knowledge Ops', role: ROLES.KNOWLEDGE_MANAGER, status: 'Active', lastLogin: '2026-08-07 14:00' },
    { id: 'USR-004', name: 'David Vance', email: 'david@enterprise.ai', dept: 'Governance', role: ROLES.REVIEWER, status: 'Active', lastLogin: '2026-08-06 11:20' },
    { id: 'USR-005', name: 'Emily Blunt', email: 'emily@enterprise.ai', dept: 'Finance', role: ROLES.STANDARD_USER, status: 'Active', lastLogin: '2026-08-05 09:45' }
  ];

  const columns = [
    { header: 'User ID', key: 'id', render: val => `<span class="text-mono font-semibold">${val}</span>` },
    { header: 'Full Name', key: 'name', render: (val, row) => `<div class="font-semibold" style="color: var(--primary-accent);">${val}</div><div class="text-xs text-muted">${row.email}</div>` },
    { header: 'Department', key: 'dept' },
    { header: 'Assigned Role', key: 'role', type: 'badge', badgeMap: {
      [ROLES.SUPER_ADMIN]: 'badge-purple',
      [ROLES.ADMINISTRATOR]: 'badge-danger',
      [ROLES.KNOWLEDGE_MANAGER]: 'badge-info',
      [ROLES.REVIEWER]: 'badge-warning',
      [ROLES.STANDARD_USER]: 'badge-secondary'
    }},
    { header: 'Status', key: 'status', type: 'badge', badgeMap: { 'Active': 'badge-success', 'Disabled': 'badge-danger' } },
    { header: 'Last Login', key: 'lastLogin', render: val => `<span class="text-xs text-muted">${val}</span>` }
  ];

  const actions = [
    { name: 'edit', label: 'Edit Role', icon: 'edit-3', onClick: (row) => editUserRole(row) },
    { name: 'reset', label: 'Reset Pass', icon: 'key', onClick: (row) => showToast(`Password reset link sent to ${row.email}`, 'info') }
  ];

  const table = renderDataTable({ columns, data: mockUsers, actions });
  tableContainer.appendChild(table);
  page.appendChild(tableContainer);

  function handleCreateUserModal() {
    openModal({
      title: 'Create New User Account',
      content: `
        <div class="flex-col gap-3">
          <div><label class="text-xs font-semibold text-muted">Full Name</label><input type="text" id="new-user-name" class="form-input" placeholder="Jane Doe"></div>
          <div><label class="text-xs font-semibold text-muted">Email Address</label><input type="email" id="new-user-email" class="form-input" placeholder="jane@enterprise.ai"></div>
          <div>
            <label class="text-xs font-semibold text-muted">Assign Security Role</label>
            <select id="new-user-role" class="form-select">
              ${Object.values(ROLES).map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      footerButtons: [
        { label: 'Cancel', className: 'btn-secondary' },
        { label: 'Create Account', className: 'btn-primary', onClick: (close) => {
          showToast('New user account created successfully!', 'success');
          close();
        }}
      ]
    });
  }

  function editUserRole(user) {
    openModal({
      title: `Edit Role for ${user.name}`,
      content: `
        <div class="flex-col gap-3">
          <div><span class="text-muted">User:</span> <strong>${user.name} (${user.email})</strong></div>
          <div>
            <label class="text-xs font-semibold text-muted">Select Security Role</label>
            <select id="edit-user-role" class="form-select">
              ${Object.values(ROLES).map(r => `<option value="${r}" ${user.role === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      footerButtons: [
        { label: 'Cancel', className: 'btn-secondary' },
        { label: 'Save Changes', className: 'btn-primary', onClick: (close) => {
          showToast(`Updated role for ${user.name}`, 'success');
          close();
        }}
      ]
    });
  }

  return page;
}

window.renderUsersPage = renderUsersPage;
