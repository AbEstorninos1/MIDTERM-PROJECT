const inventoryTableBody = document.getElementById('inventoryTableBody');
const inventorySearch = document.getElementById('inventorySearch');
const categoryFilter = document.getElementById('categoryFilter');
const inventorySort = document.getElementById('inventorySort');
const inventoryPrev = document.getElementById('inventoryPrev');
const inventoryNext = document.getElementById('inventoryNext');
const inventoryPage = document.getElementById('inventoryPage');
const addProductBtn = document.getElementById('addProductBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');

const inventoryPageSize = 10;
const lowStockLimit = 10;
const maxImageSize = 2 * 1024 * 1024;
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];

let inventoryProducts = [];
let inventoryCategories = [];
let currentInventoryPage = 1;

function getStock(product) {
  if (product.variants.length === 0) return Number(product.stock || 0);

  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

function getPriceText(product) {
  if (product.variants.length === 0) return formatPeso(product.price);

  const prices = product.variants.map(variant => variant.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);

  return lowest === highest
    ? formatPeso(lowest)
    : `${formatPeso(lowest)} - ${formatPeso(highest)}`;
}

function getStockBadge(product) {
  const stock = getStock(product);

  let className = 'in-stock';
  if (stock <= 0) className = 'out-of-stock';
  else if (stock <= lowStockLimit) className = 'low-stock';

  return `<span class="stock-status ${className}">${stock}</span>`;
}

function getVisibleProducts() {
  const search = inventorySearch.value.toLowerCase().trim();
  const category = categoryFilter.value;

  const sorters = {
    newest: (a, b) => b.id - a.id,
    'most-sold': (a, b) => b.sold - a.sold,
    'least-sold': (a, b) => a.sold - b.sold,
    'highest-stock': (a, b) => getStock(b) - getStock(a),
    'lowest-stock': (a, b) => getStock(a) - getStock(b)
  };

  return inventoryProducts.filter(product => {
    const matchesCategory =
      category === 'all' ||
      String(product.categoryId) === category;

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      (product.barcode ?? '').includes(search) ||
      product.variants.some(variant =>
        variant.name.toLowerCase().includes(search) ||
        variant.barcode.includes(search)
      );

    return matchesCategory && matchesSearch;
  }).sort(sorters[inventorySort.value]);
}

function renderCategoryFilter() {
  const selected = categoryFilter.value || 'all';

  categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
    inventoryCategories.map(category => `
      <option value="${category.id}">${escapeHTML(category.name)}</option>
    `).join('');

  categoryFilter.value = selected;

  if (categoryFilter.value !== selected) categoryFilter.value = 'all';
}

function renderInventory() {
  const products = getVisibleProducts();
  const totalPages = Math.max(1, Math.ceil(products.length / inventoryPageSize));

  currentInventoryPage = Math.min(currentInventoryPage, totalPages);

  const start = (currentInventoryPage - 1) * inventoryPageSize;
  const visible = products.slice(start, start + inventoryPageSize);

  inventoryTableBody.innerHTML = visible.map(product => `
    <tr data-id="${product.id}">
      <td>
        <div class="inventory-product">
          <img
            class="inventory-thumb"
            src="${getPlaceholderSrc()}"
            ${product.image ? `data-image="${escapeHTML(product.image)}"` : ''}
            alt=""
          >
          <span>${escapeHTML(product.name)}</span>
        </div>
      </td>
      <td>${escapeHTML(product.category)}</td>
      <td>${getPriceText(product)}</td>
      <td>${getStockBadge(product)}</td>
      <td class="inventory-row-actions">
        <button type="button" class="stock-btn" data-stock="${product.id}">Add Stock</button>
        <button type="button" class="edit-btn" data-edit="${product.id}">Edit</button>
        <button type="button" class="remove-btn" data-remove="${product.id}">Remove</button>
      </td>
    </tr>
  `).join('');

  if (visible.length === 0) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:30px;">
          No products found
        </td>
      </tr>
    `;
  }

  loadImages(inventoryTableBody);

  inventoryPage.textContent = `Page ${currentInventoryPage} of ${totalPages}`;
  inventoryPrev.disabled = currentInventoryPage === 1;
  inventoryNext.disabled = currentInventoryPage === totalPages;
}

async function loadInventory() {
  try {
    const data = await fetchInventory();

    inventoryProducts = data.products;
    inventoryCategories = data.categories;

    renderCategoryFilter();
    renderInventory();
  } catch (error) {
    console.error('Failed to load inventory:', error);

    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:30px;">
          Failed to load products
        </td>
      </tr>
    `;
  }
}


function renderBarcode(svg, value) {
  svg.innerHTML = '';

  if (!value) return;

  const options = { height: 50, fontSize: 14, margin: 4 };

  try {
    JsBarcode(svg, value, {
      ...options,
      format: /^\d{13}$/.test(value) ? 'EAN13' : 'CODE128'
    });
  } catch (error) {
    try {
      JsBarcode(svg, value, { ...options, format: 'CODE128' });
    } catch (fallbackError) {
      svg.innerHTML = '';
    }
  }
}

function setupBarcodePreviews(modal) {
  const refresh = group => {
    renderBarcode(group.querySelector('svg'), group.querySelector('input').value.trim());
  };

  modal.querySelectorAll('.barcode-group').forEach(refresh);

  modal.addEventListener('input', event => {
    const group = event.target.closest('.barcode-group');
    if (group) refresh(group);
  });
}

function setupImageDrop(modal) {
  const zone = modal.querySelector('#dropZone');
  const input = zone.querySelector('input[type="file"]');
  const preview = zone.querySelector('img');
  const error = modal.querySelector('.modal-error');

  function chooseFile(file) {
    if (!file) return;

    if (!imageTypes.includes(file.type)) {
      input.value = '';
      error.textContent = 'Only JPG, PNG or WEBP images are allowed.';
      return;
    }

    if (file.size > maxImageSize) {
      input.value = '';
      error.textContent = 'The image must be 2 MB or smaller.';
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(file);

    input.files = transfer.files;
    preview.src = URL.createObjectURL(file);
    error.textContent = '';
  }

  input.addEventListener('change', () => chooseFile(input.files[0]));

  zone.addEventListener('dragover', event => {
    event.preventDefault();
    zone.classList.add('dragging');
  });

  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));

  zone.addEventListener('drop', event => {
    event.preventDefault();
    zone.classList.remove('dragging');
    chooseFile(event.dataTransfer.files[0]);
  });
  modal.addEventListener('dragover', event => event.preventDefault());
  modal.addEventListener('drop', event => event.preventDefault());
}
function getSingleFields(product) {
  return `
    <div class="field-row">
      <label class="field">
        <span>Price (₱)</span>
        <input type="number" name="price" value="${product.price ?? ''}" min="0" step="0.01" required>
      </label>

      <label class="field">
        <span>Stock</span>
        <input type="number" name="stock" value="${product.stock ?? ''}" min="0" step="1" required>
      </label>
    </div>

    <label class="field">
      <span>Barcode</span>
      <div class="barcode-group">
        <input
          type="text"
          name="barcode"
          value="${escapeHTML(product.barcode ?? '')}"
          maxlength="50"
        >
        <svg class="barcode-preview"></svg>
      </div>
    </label>
  `;
}

function getVariantBox(key, variant) {
  return `
    <div class="variant-box">
      <div class="variant-head">
        <input
          type="text"
          name="variants[${key}][name]"
          value="${escapeHTML(variant.name)}"
          placeholder="Variant name"
          maxlength="100"
          required
        >
        <button type="button" class="remove-variant-btn" title="Remove variant">&times;</button>
      </div>

      <div class="field-row">
        <label class="field">
          <span>Price (₱)</span>
          <input type="number" name="variants[${key}][price]" value="${variant.price ?? ''}" min="0" step="0.01" required>
        </label>

        <label class="field">
          <span>Stock</span>
          <input type="number" name="variants[${key}][stock]" value="${variant.stock ?? ''}" min="0" step="1" required>
        </label>
      </div>

      <div class="barcode-group">
        <input
          type="text"
          name="variants[${key}][barcode]"
          value="${escapeHTML(variant.barcode ?? '')}"
          maxlength="50"
          placeholder="Barcode"
        >
        <svg class="barcode-preview"></svg>
      </div>
    </div>
  `;
}

function getProductForm(product) {
  const categories = inventoryCategories
    .map(category => `<option value="${escapeHTML(category.name)}"></option>`)
    .join('');

  const hasVariants = product.variants.length > 0;

  const variantBoxes = hasVariants
    ? product.variants.map(variant => getVariantBox(variant.id, variant)).join('')
    : getVariantBox('n1', {});

  return `
    <div class="product-picture">
    <label class="drop-zone" id="dropZone">
      <img
        src="${getPlaceholderSrc()}"
        ${product.image ? `data-image="${escapeHTML(product.image)}"` : ''}
        alt=""
      >
      <span>Drag an image here or click to choose one</span>
      <small>JPG, PNG or WEBP, up to 2 MB</small>
      <input type="file" name="image" accept="image/jpeg,image/png,image/webp" hidden>
    </label>
    </div>

    <div class="product-fields">
    <label class="field">
      <span>Product name</span>
      <input type="text" name="name" value="${escapeHTML(product.name)}" maxlength="100" required>
    </label>

    <label class="field">
      <span>Category</span>
      <input type="text" name="category" value="${escapeHTML(product.category)}" list="categoryList" maxlength="100" required>
    </label>
    <datalist id="categoryList">${categories}</datalist>

    <label class="checkbox-field">
      <input type="checkbox" name="has_variants" value="1" id="hasVariants" ${hasVariants ? 'checked' : ''}>
      <span>with variants</span>
    </label>

    <fieldset class="single-fields" ${hasVariants ? 'disabled hidden' : ''}>
      ${getSingleFields(product)}
    </fieldset>

    <fieldset class="variant-fields" ${hasVariants ? '' : 'disabled hidden'}>
      <div id="variantList">${variantBoxes}</div>
      <button type="button" class="add-variant-btn" id="addVariantBtn">+ Add variant</button>
    </fieldset>

    <p class="modal-error"></p>
    </div>
  `;
}

function setupVariantControls(modal) {
  const checkbox = modal.querySelector('#hasVariants');
  const single = modal.querySelector('.single-fields');
  const multi = modal.querySelector('.variant-fields');
  const list = modal.querySelector('#variantList');
  let counter = list.querySelectorAll('.variant-box').length + 1;

  function toggle() {
    const on = checkbox.checked;

    single.disabled = on;
    single.hidden = on;
    multi.disabled = !on;
    multi.hidden = !on;
  }

  checkbox.addEventListener('change', toggle);

  modal.querySelector('#addVariantBtn').addEventListener('click', () => {
    list.insertAdjacentHTML('beforeend', getVariantBox('n' + counter++, {}));
    list.lastElementChild.querySelector('input').focus();
  });

  list.addEventListener('click', event => {
    const remove = event.target.closest('.remove-variant-btn');
    if (!remove) return;

    if (list.querySelectorAll('.variant-box').length === 1) {
      modal.querySelector('.modal-error').textContent = 'A product with variants needs at least one variant.';
      return;
    }

    remove.closest('.variant-box').remove();
  });

  toggle();
}

function openProductModal() {
  const product = null;
  const current = product ?? {
    name: '',
    category: '',
    price: null,
    stock: null,
    barcode: '',
    image: null,
    variants: []
  };

  const modal = createModal(
    product ? current.name : 'Add Product',
    getProductForm(current),
    async (formData, form) => {
      if (product) formData.append('id', product.id);

      const result = await saveProduct(formData);

      if (!result.success) {
        form.querySelector('.modal-error').textContent = result.message;
        return false;
      }

      await loadInventory();
    },
    'product-modal'
  );

  setupImageDrop(modal);
  setupVariantControls(modal);
  setupBarcodePreviews(modal);
  loadImages(modal);
}

inventoryTableBody.addEventListener('click', async event => {
  const findProduct = id => inventoryProducts.find(item => String(item.id) === String(id));

  const removeButton = event.target.closest('.remove-btn');

  if (removeButton) {
    if (!(await askModal('Remove this product?', 'Remove'))) return;

    const result = await deleteProduct(removeButton.dataset.remove);

    if (!result.success) {
      errorModal(result.message);
      return;
    }

    successModal(result.message || 'The product was removed.');
    await loadInventory();
    return;
  }

  const stockButton = event.target.closest('.stock-btn');

  if (stockButton) {
    const product = findProduct(stockButton.dataset.stock);
    if (product) openStockModal(product);
    return;
  }

  const editButton = event.target.closest('.edit-btn');

  if (editButton) {
    const product = findProduct(editButton.dataset.edit);
    if (product) openEditModal(product);
    return;
  }

  const row = event.target.closest('tr[data-id]');
  if (!row) return;

  const product = findProduct(row.dataset.id);

  if (product) openInfoModal(product);
});



function downloadBarcode(svg, fileName) {
  const width = parseFloat(svg.getAttribute('width')) || svg.getBoundingClientRect().width;
  const height = parseFloat(svg.getAttribute('height')) || svg.getBoundingClientRect().height;
  const scale = 3;

  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', width);
  clone.setAttribute('height', height);

  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, 'image/png');
  };

  image.src = 'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(new XMLSerializer().serializeToString(clone));
}

function getBarcodeBlock(label, barcode) {
  if (!barcode) {
    return `<div class="info-barcode"><span class="info-label">${escapeHTML(label)}</span><span>No barcode</span></div>`;
  }

  return `
    <div class="info-barcode" data-barcode="${escapeHTML(barcode)}" data-label="${escapeHTML(label)}">
      <span class="info-label">${escapeHTML(label)}</span>
      <svg class="barcode-preview"></svg>
      <button type="button" class="download-barcode-btn">Download barcode</button>
    </div>
  `;
}

function fileSafe(text) {
  return String(text).trim().replace(/[^\w\-]+/g, '_') || 'barcode';
}

function openInfoModal(product) {
  const hasVariants = product.variants.length > 0;

  const body = `
    <img
      class="info-image"
      src="${getPlaceholderSrc()}"
      ${product.image ? `data-image="${escapeHTML(product.image)}"` : ''}
      alt=""
    >

    <div class="detail-list">
      <div><span>Name</span><span>${escapeHTML(product.name)}</span></div>
      <div><span>Category</span><span>${escapeHTML(product.category)}</span></div>
      <div><span>Price</span><span>${getPriceText(product)}</span></div>
      <div><span>Stock</span><span>${getStock(product)}</span></div>
    </div>

    ${hasVariants
      ? product.variants.map(variant => `
          <div class="variant-box">
            <div class="detail-list">
              <div><span>Variant</span><span>${escapeHTML(variant.name)}</span></div>
              <div><span>Price</span><span>${formatPeso(variant.price)}</span></div>
              <div><span>Stock</span><span>${variant.stock}</span></div>
            </div>
            ${getBarcodeBlock(`${product.name} - ${variant.name}`, variant.barcode)}
          </div>
        `).join('')
      : getBarcodeBlock(product.name, product.barcode)}
  `;


  const modal = createModal('Product Info', body, null, 'wide');

  modal.querySelectorAll('.info-barcode[data-barcode]').forEach(block => {
    renderBarcode(block.querySelector('svg'), block.dataset.barcode);

    block.querySelector('.download-barcode-btn').addEventListener('click', () => {
      downloadBarcode(
        block.querySelector('svg'),
        `${fileSafe(block.dataset.label)}-${fileSafe(block.dataset.barcode)}.png`
      );
    });
  });

  loadImages(modal);
}

function openEditModal(product) {
  const hasVariants = product.variants.length > 0;

  const priceFields = hasVariants
    ? product.variants.map(variant => `
        <div class="variant-box">
          <label class="field">
            <span>Variant name</span>
            <input type="text" name="variants[${variant.id}][name]" value="${escapeHTML(variant.name)}" maxlength="100" required>
          </label>

          <label class="field">
            <span>Price (₱)</span>
            <input type="number" name="variants[${variant.id}][price]" value="${variant.price}" min="0" step="0.01" required>
          </label>
        </div>
      `).join('')
    : `
        <label class="field">
          <span>Price (₱)</span>
          <input type="number" name="price" value="${product.price}" min="0" step="0.01" required>
        </label>
      `;

  const modal = createModal(
    'Edit Product',
    `
      <div class="product-picture">
      <label class="drop-zone" id="dropZone">
        <img
          src="${getPlaceholderSrc()}"
          ${product.image ? `data-image="${escapeHTML(product.image)}"` : ''}
          alt=""
        >
        <span>Drag an image here or click to add</span>
        <small>JPG, PNG or WEBP, up to 2 MB</small>
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp" hidden>
      </label>
      </div>

      <div class="product-fields">
      <label class="field">
        <span>Product name</span>
        <input type="text" name="name" value="${escapeHTML(product.name)}" maxlength="100" required>
      </label>

      ${priceFields}

      <p class="modal-error"></p>
      </div>
    `,
    async (formData, form) => {
      formData.append('action', 'edit');
      formData.append('id', product.id);

      const result = await saveProduct(formData);

      if (!result.success) {
        form.querySelector('.modal-error').textContent = result.message;
        return false;
      }

      await loadInventory();
    },
    'product-modal'
  );

  setupImageDrop(modal);
  loadImages(modal);
}

function openStockModal(product) {
  const hasVariants = product.variants.length > 0;

  const rows = hasVariants
    ? product.variants.map(variant => `
        <label class="stock-row">
          <span class="stock-row-name">${escapeHTML(variant.name)}</span>
          <input type="number" data-variant="${variant.id}" min="0" step="1" placeholder="Quantity">
        </label>
      `).join('')
    : `
        <label class="stock-row">
          <span class="stock-row-name">${escapeHTML(product.name)}</span>
          <span class="stock-row-current">In stock: ${Number(product.stock || 0)}</span>
          <input type="number" data-variant="" min="0" step="1" placeholder="Quantity">
        </label>
      `;

  const modal = createModal(
    `Add Stock - ${product.name}`,
    `
      ${rows}
      <p class="modal-error"></p>
    `,
    async (formData, form) => {
      const items = [];

      for (const input of form.querySelectorAll('input[data-variant]')) {
        const raw = input.value.trim();
        if (raw === '' || Number(raw) === 0) continue;

        if (!/^\d+$/.test(raw)) {
          form.querySelector('.modal-error').textContent = 'Use whole numbers of 1 or more.';
          return false;
        }

        items.push({
          variant_id: input.dataset.variant ? Number(input.dataset.variant) : null,
          quantity: Number(raw)
        });
      }

      if (items.length === 0) {
        form.querySelector('.modal-error').textContent = 'Enter a quantity to add.';
        return false;
      }

      const result = await addStock(product.id, items);

      if (!result.success) {
        form.querySelector('.modal-error').textContent = result.message;
        return false;
      }

      await loadInventory();
    }
  );

  modal.querySelector('.saveModalbtn').textContent = 'Add Stock';
  modal.querySelector('input').focus();
}

addProductBtn.addEventListener('click', () => openProductModal());

function openCategoryModal() {
  const existing = inventoryCategories
    .map(category => `<li>${escapeHTML(category.name)}</li>`)
    .join('');

  const modal = createModal(
    'Add Category',
    `
      <label class="field">
        <span>Category name</span>
        <input type="text" name="name" maxlength="100" required autofocus>
      </label>

      <p class="modal-error"></p>

      <div class="category-existing">
        <span>Existing categories (${inventoryCategories.length})</span>
        <ul>${existing || '<li>None yet</li>'}</ul>
      </div>
    `,
    async (formData, form) => {
      const result = await addCategory(String(formData.get('name')).trim());

      if (!result.success) {
        form.querySelector('.modal-error').textContent = result.message;
        return false;
      }

      await loadInventory();
    }
  );

  modal.querySelector('input[name="name"]').focus();
}

addCategoryBtn.addEventListener('click', openCategoryModal);

[inventorySearch, categoryFilter, inventorySort].forEach(control => {
  control.addEventListener(control === inventorySearch ? 'input' : 'change', () => {
    currentInventoryPage = 1;
    renderInventory();
  });
});

inventoryPrev.addEventListener('click', () => {
  currentInventoryPage--;
  renderInventory();
});

inventoryNext.addEventListener('click', () => {
  currentInventoryPage++;
  renderInventory();
});
