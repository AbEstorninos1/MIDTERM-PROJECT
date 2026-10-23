const receiptPreview = document.getElementById('recordPreview');
const storeName = 'JM Aviles Hardware';

function formatDate(dateText) {
  return new Date(dateText).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function createReceiptText(className, text) {
  const line = document.createElement('div');
  line.className = className;
  line.textContent = text;
  return line;
}

function createReceiptRow(leftText, rightText) {
  const row = document.createElement('div');
  const left = document.createElement('span');
  const right = document.createElement('span');

  row.className = 'receipt-row';
  left.textContent = leftText;
  right.textContent = rightText;
  row.append(left, right);

  return row;
}

function createReceiptDivider() {
  const divider = document.createElement('div');
  divider.className = 'receipt-divider';
  return divider;
}

function showReceipt(record) {
  receiptPreview.replaceChildren();

  const store = document.createElement('strong');
  store.className = 'receipt-store';
  store.textContent = storeName;

  receiptPreview.append(
    store,
    createReceiptText('receipt-center', 'Receipt #' + record.receiptNo),
    createReceiptText('receipt-center', formatDate(record.date)),
    createReceiptText('receipt-center', 'Cashier: ' + record.cashier),
    createReceiptDivider()
  );

  const receiptItems = document.createElement('div');
  receiptItems.className = 'receipt-items';

  for (const item of record.items) {
    const variantName = item.variant ? ' (' + item.variant + ')' : '';
    const lineTotal = item.quantity * item.price;

    receiptItems.append(
      createReceiptRow(
        item.quantity + ' × ' + item.name + variantName,
        formatMoney(lineTotal)
      )
    );
  }

  const totalRow = createReceiptRow('Total', formatMoney(record.total));
  totalRow.classList.add('receipt-total');

  receiptPreview.append(
    receiptItems,
    createReceiptDivider(),
    totalRow,
    createReceiptRow(record.paymentMethod, formatMoney(record.paid)),
    createReceiptRow('Change', formatMoney(record.change))
  );
}

function clearReceipt() {
  receiptPreview.replaceChildren();
}

function printReceipt() {
  if (!receiptPreview.childElementCount) {
    showModal('Please select a record first.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=420,height=640');

  if (!printWindow) {
    showModal('Please allow pop-ups to print.');
    return;
  }

  const stylesheets = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .map(link => `<link rel="stylesheet" href="${link.href}">`)
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        ${stylesheets}
      </head>
      <body>
        ${receiptPreview.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}