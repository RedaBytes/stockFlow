Auth.requireAuth();
renderSidebar('movements');

const isAdmin = Auth.isAdmin();
let currentMode = 'in'; 
let productList = [];

const modal = document.getElementById('move-modal');
const form = document.getElementById('move-form');
const errorBox = document.getElementById('move-error');

function renderTable(movements) {
  const body = document.getElementById('movements-body');

  if (movements.length === 0) {
    body.innerHTML = '<tr class="empty-row"><td colspan="5">No stock movements recorded yet.</td></tr>';
    return;
  }

  body.innerHTML = movements.map((m) => `
    <tr>
      <td>${formatDate(m.created_at)}</td>
      <td>${escapeHtml(m.product_name)}</td>
      <td>${escapeHtml(m.sku)}</td>
      <td><span class="badge ${m.type === 'IN' ? 'in' : 'out'}">${m.type}</span></td>
      <td class="num">${m.quantity}</td>
    </tr>
  `).join('');
}

async function load() {
  try {
    const data = await Api.getMovements();
    renderTable(data.movements);
  } catch (err) {
    showToast(err.message, true);
  }
}

async function openModal(mode) {
  currentMode = mode;
  errorBox.innerHTML = '';
  form.reset();

  document.getElementById('move-modal-title').textContent = mode === 'in' ? 'Stock in' : 'Stock out';
  document.getElementById('move-modal-sub').textContent = mode === 'in'
    ? 'Increase quantity on hand for a product.'
    : 'Decrease quantity on hand for a product.';
  document.getElementById('save-move-btn').textContent = mode === 'in' ? 'Add stock' : 'Remove stock';

  try {
    const data = await Api.getProducts();
    productList = data.products;
    const select = document.getElementById('move-product');
    select.innerHTML = productList.map((p) =>
      `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.sku)}) — ${p.quantity} on hand</option>`
    ).join('');
  } catch (err) {
    showToast(err.message, true);
    return;
  }

  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
}

document.getElementById('stock-in-btn').addEventListener('click', () => openModal('in'));
document.getElementById('stock-out-btn').addEventListener('click', () => openModal('out'));
document.getElementById('cancel-move-btn').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.innerHTML = '';

  const productId = document.getElementById('move-product').value;
  const quantity = Number(document.getElementById('move-quantity').value);

  try {
    if (currentMode === 'in') {
      await Api.stockIn(productId, quantity);
      showToast('Stock added');
    } else {
      await Api.stockOut(productId, quantity);
      showToast('Stock removed');
    }
    closeModal();
    load();
  } catch (err) {
    errorBox.innerHTML = `<div class="error-msg">${escapeHtml(err.message)}</div>`;
  }
});

if (!isAdmin) {
  document.getElementById('stock-in-btn').style.display = 'none';
  document.getElementById('stock-out-btn').style.display = 'none';
}

load();
