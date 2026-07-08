Auth.requireAuth();
renderSidebar('suppliers');

let allSuppliers = [];
const isAdmin = Auth.isAdmin();

const modal = document.getElementById('supplier-modal');
const form = document.getElementById('supplier-form');
const errorBox = document.getElementById('supplier-error');

function renderTable(suppliers) {
  const body = document.getElementById('suppliers-body');

  if (suppliers.length === 0) {
    body.innerHTML = '<tr class="empty-row"><td colspan="4">No suppliers yet.</td></tr>';
    return;
  }

  body.innerHTML = suppliers.map((s) => `
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email) || '—'}</td>
      <td>${escapeHtml(s.phone) || '—'}</td>
      <td>
        ${isAdmin ? `
          <button class="btn btn-secondary" data-edit="${s.id}" style="padding:5px 10px;font-size:0.78rem;">Edit</button>
          <button class="btn btn-danger" data-delete="${s.id}" style="padding:5px 10px;font-size:0.78rem;">Delete</button>
        ` : ''}
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.edit));
  });
  body.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteSupplier(btn.dataset.delete));
  });
}

async function load() {
  try {
    const data = await Api.getSuppliers();
    allSuppliers = data.suppliers;
    renderTable(allSuppliers);
  } catch (err) {
    showToast(err.message, true);
  }
}

function openModal(id) {
  errorBox.innerHTML = '';
  form.reset();
  if (id) {
    const supplier = allSuppliers.find((s) => String(s.id) === String(id));
    document.getElementById('modal-title').textContent = 'Edit supplier';
    document.getElementById('supplier-id').value = supplier.id;
    document.getElementById('supplier-name').value = supplier.name;
    document.getElementById('supplier-email').value = supplier.email || '';
    document.getElementById('supplier-phone').value = supplier.phone || '';
  } else {
    document.getElementById('modal-title').textContent = 'New supplier';
    document.getElementById('supplier-id').value = '';
  }
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
}

document.getElementById('new-supplier-btn').addEventListener('click', () => openModal(null));
document.getElementById('cancel-supplier-btn').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.innerHTML = '';

  const id = document.getElementById('supplier-id').value;
  const payload = {
    name: document.getElementById('supplier-name').value.trim(),
    email: document.getElementById('supplier-email').value.trim(),
    phone: document.getElementById('supplier-phone').value.trim(),
  };

  try {
    if (id) {
      await Api.updateSupplier(id, payload);
      showToast('Supplier updated');
    } else {
      await Api.createSupplier(payload);
      showToast('Supplier created');
    }
    closeModal();
    load();
  } catch (err) {
    errorBox.innerHTML = `<div class="error-msg">${escapeHtml(err.message)}</div>`;
  }
});

async function deleteSupplier(id) {
  if (!confirm('Delete this supplier? This cannot be undone.')) return;
  try {
    await Api.deleteSupplier(id);
    showToast('Supplier deleted');
    load();
  } catch (err) {
    showToast(err.message, true);
  }
}

if (!isAdmin) {
  document.getElementById('new-supplier-btn').style.display = 'none';
}

load();
