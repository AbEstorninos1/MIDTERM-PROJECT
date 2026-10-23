const checkoutModal = document.getElementById('checkoutModal');
const paymentTotal = document.getElementById('paymentTotal');
const paymentAmount = document.getElementById('paymentAmount');
const paymentChange = document.getElementById('paymentChange');
const changeAmount = document.getElementById('changeAmount');
const receiptCash = document.getElementById('receiptCash');
const receiptChange = document.getElementById('receiptChange');
const confirmPayment = document.getElementById('confirmPayment');

function formatMoney(amount) {
  return '₱' + amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getTotal() {
  return Number(paymentTotal.textContent.replace(/[^0-9.]/g, ''));
}

function updatePayment() {
  const total = getTotal();
  const cash = Number(paymentAmount.value) || 0;
  const valid = paymentAmount.value !== '' && cash >= total && total > 0;
  const change = Math.max(0, cash - total);

  changeAmount.textContent = formatMoney(change);
  receiptCash.textContent = formatMoney(cash);
  receiptChange.textContent = formatMoney(change);

  paymentChange.hidden = !valid;
  confirmPayment.disabled = !valid;
}

function quickCash(event) {
  const button = event.currentTarget;

  if (button.dataset.cash === 'exact') {
    paymentAmount.value = getTotal();
  } else {
    paymentAmount.value = Number(button.dataset.cash);
  }

  updatePayment();
}

const quickButtons = document.querySelectorAll('[data-cash]');

for (const button of quickButtons) {
  button.addEventListener('click', quickCash);
}

paymentAmount.addEventListener('input', updatePayment);

function openCheckout(total) {
  paymentTotal.textContent = formatMoney(total);
  paymentAmount.value = '';
  checkoutModal.hidden = false;
  updatePayment();
}

function closeCheckout() {
  checkoutModal.hidden = true;
}

document.getElementById('closeCheckout').addEventListener('click', closeCheckout);
document.getElementById('cancelCheckout').addEventListener('click', closeCheckout);

function checkout() {
  const items = document.querySelectorAll('#cartItems .cart-item');

  if (items.length === 0) {
    showModal('Cart is empty.');
    return;
  }

  const receiptItems = document.getElementById('checkoutReceiptItems');
  receiptItems.replaceChildren();

  let total = 0;

  for (const item of items) {
    const row = document.createElement('div');
    const name = document.createElement('span');
    const price = document.createElement('span');

    const quantity = item.querySelector('.cart-item-quantity').textContent;
    const product = item.querySelector('.cart-item-details p').textContent;
    const variant = item.querySelector('.cart-item-details > span:not(.line-total)').textContent;
    const lineTotalText = item.querySelector('.line-total').textContent;

    name.textContent = quantity + ' × ' + product + (variant ? ' (' + variant + ')' : '');
    price.textContent = lineTotalText;

    row.append(name, price);
    receiptItems.appendChild(row);

    total += Number(lineTotalText.replace(/[^0-9.]/g, ''));
  }

  document.getElementById('receiptTotal').textContent = formatMoney(total);
  openCheckout(total);
}

async function completePayment() {
  const cartRows = document.querySelectorAll('#cartItems .cart-item');
  const items = [];
  let total = 0;

  for (const row of cartRows) {
    const productId = Number(row.dataset.productId);
    const variantId = row.dataset.variantId ? Number(row.dataset.variantId) : null;
    const quantity = Number(row.querySelector('.cart-item-quantity').textContent);
    const lineTotal = Number(row.querySelector('.line-total').textContent.replace(/[^0-9.]/g, ''));
    const variant = row.querySelector('.cart-item-details > span:not(.line-total)').textContent;

    if (!Number.isInteger(productId) || productId <= 0 ||
        (variantId !== null && (!Number.isInteger(variantId) || variantId <= 0)) ||
        !Number.isInteger(quantity) || quantity <= 0) {
      showModal('Invalid product information. Please refresh the cart.');
      return;
    }

    items.push({
      productId: productId,
      variantId: variantId,
      name: row.querySelector('.cart-item-details p').textContent,
      variant: variant === '' ? null : variant,
      quantity: quantity,
      price: lineTotal / quantity
    });

    total += lineTotal;
  }

  const paid = Number(paymentAmount.value);

  if (items.length === 0 || !Number.isFinite(paid) || paid < total || total <= 0) {
    showModal('Invalid payment amount.');
    return;
  }

  confirmPayment.disabled = true;

  try {
    const data = await createSale(items, total, paid);

    if (!data.success) {
      throw new Error(data.message || 'Unable to save sale.');
    }

    closeCheckout();
    document.getElementById('cartItems').replaceChildren();

    showModal('Payment successful. Change: ' + formatMoney(paid - total), null, 'success');

    initialize();
  } catch (error) {
    console.error(error);
    showModal(error.message || 'Unable to save the payment. Please try again.');
  } finally {
    updatePayment();
  }
}

confirmPayment.addEventListener('click', completePayment);