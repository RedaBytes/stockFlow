Auth.requireAuth();
renderSidebar('products');

let allProducts = [];
const isAdmin = Auth.isAdmin();

const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');
const errorBox = document.getElementById('product-error');

function renderTable(products) {
  const body = document.getElementById('products-body');

  if (products.length === 0) {
    body.innerHTML = '<tr class="empty-row"><td colspan="5">No products found.</td></tr>';
    return;
  }

  body.innerHTML = products.map((p) => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.sku)}</td>
      <td class="num">${formatMoney(p.price)}</td>
      <td class="num">${p.quantity}</td>
      <td>
        ${isAdmin ? `
          <button class="btn btn-secondary" data-edit="${p.id}" style="padding:5px 10px;font-size:0.78rem;">Edit</button>
          <button class="btn btn-danger" data-delete="${p.id}" style="padding:5px 10px;font-size:0.78rem;">Delete</button>
        ` : ''}
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.edit));
  });
  body.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.delete));
  });
}

async function load() {
  try {
    const data = await Api.getProducts();
    allProducts = data.products;
    renderTable(allProducts);
  } catch (err) {
    showToast(err.message, true);
  }
}

document.getElementById('search-input').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  );
  renderTable(filtered);
});

function openModal(id) {
  errorBox.innerHTML = '';
  form.reset();
  if (id) {
    const product = allProducts.find((p) => String(p.id) === String(id));
    document.getElementById('modal-title').textContent = 'Edit product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-sku').value = product.sku;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-description').value = product.description || '';
  } else {
    document.getElementById('modal-title').textContent = 'New product';
    document.getElementById('product-id').value = '';
  }
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
}

document.getElementById('new-product-btn').addEventListener('click', () => openModal(null));
document.getElementById('cancel-product-btn').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.innerHTML = '';

  const id = document.getElementById('product-id').value;
  const payload = {
    name: document.getElementById('product-name').value.trim(),
    sku: document.getElementById('product-sku').value.trim(),
    price: Number(document.getElementById('product-price').value),
    description: document.getElementById('product-description').value.trim(),
  };

  try {
    if (id) {
      await Api.updateProduct(id, payload);
      showToast('Product updated');
    } else {
      await Api.createProduct(payload);
      showToast('Product created');
    }
    closeModal();
    load();
  } catch (err) {
    errorBox.innerHTML = `<div class="error-msg">${escapeHtml(err.message)}</div>`;
  }
});

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await Api.deleteProduct(id);
    showToast('Product deleted');
    load();
  } catch (err) {
    showToast(err.message, true);
  }
}

if (!isAdmin) {
  document.getElementById('new-product-btn').style.display = 'none';
}

load();
