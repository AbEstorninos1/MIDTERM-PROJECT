async function fetchProducts() {
  const res = await fetch('../api/cashier/products/products.php', { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch products.');
  }

  const result = await res.json();

  products = [];
  category.clear();
  category.add('All');

  result.forEach(data => {
    getData(
      data.id,
      data.name,
      data.category,
      data.variants,
      data.price,
      data.stock,
      data.barcode,
      data.image
    );
  });


  document.querySelectorAll('#cartItems .cart-item').forEach(row => {
    const quantity = Number(row.querySelector('.cart-item-quantity').textContent);

    changeStock(row.dataset.productId, row.dataset.variantId, -quantity);
  });
}
