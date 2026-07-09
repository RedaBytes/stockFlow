Auth.requireAuth();
renderSidebar('users');

const currentUser = Auth.getUser();
const canManageRoles = Auth.isSuperAdmin();

if (!Auth.isAdmin()) {
  document.querySelector('.main').innerHTML = `
    <div class="card">
      <p class="form-sub" style="margin:0;">You need admin access to view this page.</p>
    </div>
  `;
} else {
  if (!canManageRoles) {
    document.querySelector('.page-header p').textContent =
      'Only super admins can change roles. You can view the list below.';
  }
  load();
}

async function load() {
  try {
    const data = await Api.getUsers();
    renderTable(data.users);
  } catch (err) {
    showToast(err.message, true);
  }
}

function renderTable(users) {
  const body = document.getElementById('users-body');

  if (users.length === 0) {
    body.innerHTML = '<tr class="empty-row"><td colspan="5">No users yet.</td></tr>';
    return;
  }

  body.innerHTML = users.map((u) => {
    const isSelf = u.id === currentUser.id;
    const showControls = canManageRoles && !isSelf;

    return `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge role">${escapeHtml(u.role)}</span></td>
        <td>${formatDate(u.created_at)}</td>
        <td>
          ${showControls ? `
            <select data-role-select="${u.id}" style="width:auto;display:inline-block;padding:6px 8px;font-size:0.8rem;">
              ${u.role === 'super_admin' ? '<option value="super_admin" selected disabled>super_admin (current)</option>' : ''}
              <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>staff</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
            </select>
            <button class="btn btn-secondary" data-save="${u.id}" style="padding:5px 10px;font-size:0.78rem;">Save</button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');

  if (canManageRoles) {
    body.querySelectorAll('[data-save]').forEach((btn) => {
      btn.addEventListener('click', () => saveRole(btn.dataset.save));
    });
  }
}

async function saveRole(id) {
  const select = document.querySelector(`[data-role-select="${id}"]`);
  const role = select.value;

  if (!confirm(`Change this user's role to "${role}"?`)) return;

  try {
    await Api.updateUserRole(id, role);
    showToast('Role updated');
    load();
  } catch (err) {
    showToast(err.message, true);
  }
}
