const cartItems = document.getElementById('cartItems');
function changeStock(productId, variantId, amount) {
  const product = products.find(item => Number(item.id) === Number(productId));

  if (!product) return;

  if (variantId) {
    const variant = product.variants.find(item => Number(item.id) === Number(variantId));

    if (variant) variant.stock = Number(variant.stock) + amount;
  } else {
    product.stock = Number(product.stock) + amount;
  }
}

function addCart(product, quantity) {
  const total = product.price * quantity;

  cartItems.insertAdjacentHTML('beforeend', `
    <div class="cart-item"
      data-product-id="${product.productId}"
      data-variant-id="${product.variantId ?? ''}">

      <div class="cart-item-quantity">${quantity}</div>

      <div class="cart-item-details">
        <p>${escapeHTML(product.product)}</p>
        <span>${escapeHTML(product.variant ?? '')}</span>
        <span class="line-total">₱${total.toFixed(2)}</span>
      </div>

      <button class="cart-remove" type="button">×</button>
    </div>
  `);

  changeStock(product.productId, product.variantId, -quantity);
}

cartItems.addEventListener('click', event => {
  if (event.target.classList.contains('cart-remove')) {
    const item = event.target.closest('.cart-item');
    const quantity = Number(item.querySelector('.cart-item-quantity').textContent);

    changeStock(item.dataset.productId, item.dataset.variantId, quantity);
    item.remove();
    backdefault();
  }
});

function updateCartTotal() {
  let total = 0;

  cartItems.querySelectorAll('.line-total').forEach(line => {
    total += Number(line.textContent.replace(/[^0-9.]/g, ''));
  });

  document.getElementById('cartTotalAmount').textContent = '₱' + total.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


new MutationObserver(updateCartTotal).observe(cartItems, { childList: true });
updateCartTotal();
