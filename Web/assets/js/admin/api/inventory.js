async function fetchInventory() {
  const response = await fetch('../api/admin/inventory/inventory.php', {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data;
}

async function saveProduct(formData) {
  const response = await fetch('../api/admin/inventory/inventory.php', {
    method: 'POST',
    body: formData
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: 'Server error: ' + text.slice(0, 200) };
  }
}

async function deleteProduct(id) {
  const response = await fetch('../api/admin/inventory/delete-product.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  return response.json();
}

async function addCategory(name) {
  const response = await fetch('../api/admin/inventory/add-category.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: 'Server error: ' + text.slice(0, 200) };
  }
}

async function addStock(productId, items) {
  const response = await fetch('../api/admin/inventory/add-stock.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, items })
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: 'Server error: ' + text.slice(0, 200) };
  }
}
