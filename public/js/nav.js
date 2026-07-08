function renderSidebar(activePage) {
  const root = document.getElementById('sidebar-root');
  if (!root) return;

  const user = Auth.getUser() || { name: 'User', role: 'staff' };
  const links = [
    { key: 'dashboard', href: '/dashboard.html', label: 'Dashboard' },
    { key: 'products', href: '/products.html', label: 'Products' },
    { key: 'suppliers', href: '/suppliers.html', label: 'Suppliers' },
    { key: 'movements', href: '/movements.html', label: 'Stock Movements' },
  ];

  root.innerHTML = `
    <div class="brand-mark"><span class="dot"></span><span>StockFlow</span></div>
    <nav class="nav-links">
      ${links.map((l) => `<a href="${l.href}" class="${l.key === activePage ? 'active' : ''}">${l.label}</a>`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <strong>${escapeHtml(user.name)}</strong>
        ${escapeHtml(user.role)}
      </div>
      <button class="btn btn-secondary" id="logout-btn" style="width:100%">Log out</button>
    </div>
  `;

  document.getElementById('logout-btn').addEventListener('click', () => Auth.logout());
}
