const verifyModal = document.getElementById('verifyAction');
const verifyMessage = document.getElementById('verifyMessage');
const verifyConfirm = document.getElementById('verifyConfirm');
const verifyBack = document.getElementById('verifyBack');
let modalAction = null;

const verifyIcon = document.getElementById('verifyIcon');
const verifyIcons = {
  question: 'question.svg',
  success: 'check.svg',
  warning: 'warning.svg'
};

function showModal(message, action = null, type = action ? 'question' : 'warning') {
  verifyIcon.className = `verify-icon ${type}`;
  verifyIcon.querySelector('img').src = `../assets/images/${verifyIcons[type]}`;

  verifyMessage.textContent = message;
  modalAction = action;

  verifyConfirm.textContent = action ? 'Confirm' : 'OK';
  verifyBack.hidden = !action;

  verifyModal.hidden = false;
}

function closeVerify() {
  verifyModal.hidden = true;
  modalAction = null;
}


verifyConfirm.addEventListener('click', () => {
  const action = modalAction;

  closeVerify();

  if (action) {
    action();
  }
});

verifyBack.addEventListener('click', closeVerify);


function verifyAction() {
  if (!selectedProduct) {
    showModal('Please select a product.');
    return;
  }

  if (Number(selectedProduct.stock) <= 0) {
    showModal('Out of stock.');
    numInput.value = '';
    return;
  }

  const quantity = Number(numInput.value);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    showModal('Invalid quantity.');
    numInput.value = '';
    return;
  }

  if (quantity > Number(selectedProduct.stock)) {
    showModal('Insufficient stock.');
    numInput.value = '';
    return;
  }

  const product = { ...selectedProduct };

  const productName = product.variant
    ? `${product.product} (${product.variant})`
    : product.product;

  showModal(
    `Add ${quantity} ${productName} to cart?`,
    () => {
      addCart(product, quantity);
      backdefault();
    }
  );
}

