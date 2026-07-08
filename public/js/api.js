const API_BASE = '/api';

const Auth = {
  getToken() {
    return localStorage.getItem('sf_token');
  },
  getUser() {
    const raw = localStorage.getItem('sf_user');
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem('sf_token', token);
    localStorage.setItem('sf_user', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
  },
  isLoggedIn() {
    return Boolean(this.getToken());
  },
  isAdmin() {
    const user = this.getUser();
    return Boolean(user && user.role === 'admin');
  },
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/index.html';
    }
  },
  logout() {
    this.clearSession();
    window.location.href = '/index.html';
  },
};

async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    Auth.clearSession();
    window.location.href = '/index.html';
    throw new Error('Session expired');
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const message = (data && (data.message || (data.errors && data.errors[0] && data.errors[0].message))) || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

const Api = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => apiRequest('/auth/register', { method: 'POST', body: { name, email, password } }),

  getDashboardSummary: () => apiRequest('/dashboard/summary'),

  getProducts: () => apiRequest('/products'),
  createProduct: (product) => apiRequest('/products', { method: 'POST', body: product }),
  updateProduct: (id, product) => apiRequest(`/products/${id}`, { method: 'PUT', body: product }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  getSuppliers: () => apiRequest('/suppliers'),
  createSupplier: (supplier) => apiRequest('/suppliers', { method: 'POST', body: supplier }),
  updateSupplier: (id, supplier) => apiRequest(`/suppliers/${id}`, { method: 'PUT', body: supplier }),
  deleteSupplier: (id) => apiRequest(`/suppliers/${id}`, { method: 'DELETE' }),

  getMovements: () => apiRequest('/inventory/movements'),
  stockIn: (productId, quantity) => apiRequest('/inventory/stock-in', { method: 'POST', body: { productId, quantity } }),
  stockOut: (productId, quantity) => apiRequest('/inventory/stock-out', { method: 'POST', body: { productId, quantity } }),
};

function showToast(message, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast-banner';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast-banner show' + (isError ? ' error' : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(value) {
  const n = Number(value);
  return `$${n.toFixed(2)}`;
}

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
