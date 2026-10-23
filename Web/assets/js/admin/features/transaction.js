const transactionTableBody = document.getElementById('transactionTableBody');
const transactionDateFilter = document.getElementById('transactionDateFilter');
const transactionDateFrom = document.getElementById('transactionDateFrom');
const transactionDateTo = document.getElementById('transactionDateTo');
const transactionStatusFilter = document.getElementById('transactionStatusFilter');
const transactionSearch = document.getElementById('transactionSearch');
const transactionPage = document.getElementById('transactionPage');
const transactionPrevBtn = document.getElementById('transactionPrevBtn');
const transactionNextBtn = document.getElementById('transactionNextBtn');

let transactions = [];
let currentTransactionPage = 1;

const transactionPageSize = 10;

const statusLabels = {
  completed: 'Completed',
  partial: 'Partially Refunded',
  refunded: 'Refunded',
  voided: 'Voided'
};

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTransactionStatus(transaction) {
  const status = String(transaction.status).toLowerCase();
  if (status === 'voided') return 'voided';

  const refunded = Number(transaction.refunded_amount || 0);
  if (refunded <= 0) return 'completed';

  return refunded >= Number(transaction.total) ? 'refunded' : 'partial';
}

function setTransactionDates() {
  const filter = transactionDateFilter.value;
  const today = new Date();
  const start = new Date(today);

  if (filter === 'all') {
    transactionDateFrom.value = '';
    transactionDateTo.value = '';
  } else if (filter === 'today') {
    transactionDateFrom.value = dateKey(today);
    transactionDateTo.value = dateKey(today);
  } else if (filter === 'yesterday') {
    start.setDate(start.getDate() - 1);
    transactionDateFrom.value = dateKey(start);
    transactionDateTo.value = dateKey(start);
  } else if (filter === '7days') {
    start.setDate(start.getDate() - 6);
    transactionDateFrom.value = dateKey(start);
    transactionDateTo.value = dateKey(today);
  } else if (filter === '30days') {
    start.setDate(start.getDate() - 29);
    transactionDateFrom.value = dateKey(start);
    transactionDateTo.value = dateKey(today);
  } else if (filter === 'month') {
    start.setDate(1);
    transactionDateFrom.value = dateKey(start);
    transactionDateTo.value = dateKey(today);
  } else if (filter === 'lastmonth') {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0);

    transactionDateFrom.value = dateKey(first);
    transactionDateTo.value = dateKey(last);
  } else if (filter === 'custom') {
    return;
  }

  currentTransactionPage = 1;
  renderTransactions();
}

function getFilteredTransactions() {
  const search = transactionSearch.value.toLowerCase().trim();
  const status = transactionStatusFilter.value;
  const from = transactionDateFrom.value;
  const to = transactionDateTo.value;

  return transactions.filter(transaction => {
    const date = String(transaction.created_at).slice(0, 10);

    const matchesDate =
      (!from || date >= from) &&
      (!to || date <= to);

    const matchesStatus =
      status === 'all' ||
      getTransactionStatus(transaction) === status;

    const matchesSearch =
      String(transaction.receipt_no).toLowerCase().includes(search) ||
      String(transaction.cashier).toLowerCase().includes(search);

    return matchesDate && matchesStatus && matchesSearch;
  }).sort((a, b) =>
    String(b.created_at).localeCompare(String(a.created_at))
  );
}

function showTransactionModal(transaction) {
  const status = getTransactionStatus(transaction);
  const refunded = Number(transaction.refunded_amount || 0);
  const net = Number(transaction.total) - refunded;

  const lines = transaction.lines.map(line => `
    <tr>
      <td>
        ${Number(line.quantity)} × ${escapeHTML(line.name)}${line.variant ? ` (${escapeHTML(line.variant)})` : ''}
      </td>
      <td>${formatPeso(line.quantity * line.price)}</td>
    </tr>
  `).join('');

  createModal(`Receipt ${transaction.receipt_no}`, `
    <div class="detail-list">
      <div><span>Date</span><span>${escapeHTML(transaction.created_at)}</span></div>
      <div><span>Cashier</span><span>${escapeHTML(transaction.cashier)}</span></div>
      <div><span>Payment</span><span>${escapeHTML(transaction.payment_method)}</span></div>
      <div>
        <span>Status</span>
        <span class="transaction-status ${status}">${statusLabels[status]}</span>
      </div>
    </div>

    <table class="detail-table">
      <tbody>${lines}</tbody>
    </table>

    <div class="detail-list">
      <div><span>Total</span><span>${formatPeso(transaction.total)}</span></div>
      <div><span>Paid</span><span>${formatPeso(transaction.paid)}</span></div>
      <div><span>Change</span><span>${formatPeso(transaction.change)}</span></div>
      ${refunded > 0 ? `
        <div><span>Refunded</span><span>${formatPeso(refunded)}</span></div>
        <div><span>Net</span><span>${formatPeso(net)}</span></div>
      ` : ''}
    </div>
  `, null, 'wide');
}

function renderTransactions() {
  if (!transactionTableBody) return;

  const filtered = getFilteredTransactions();
  const totalPages = Math.max(1, Math.ceil(filtered.length / transactionPageSize));

  currentTransactionPage = Math.min(currentTransactionPage, totalPages);

  const start = (currentTransactionPage - 1) * transactionPageSize;
  const visible = filtered.slice(start, start + transactionPageSize);

  transactionTableBody.innerHTML = '';

  visible.forEach(transaction => {
    const status = getTransactionStatus(transaction);
    const refunded = Number(transaction.refunded_amount || 0);

    transactionTableBody.insertAdjacentHTML('beforeend', `
      <tr data-id="${escapeHTML(transaction.id)}" class="${status === 'voided' ? 'voided-row' : ''}">
        <td>${escapeHTML(transaction.receipt_no)}</td>
        <td>${escapeHTML(transaction.created_at)}</td>
        <td>${escapeHTML(transaction.cashier)}</td>
        <td>${Number(transaction.items)}</td>
        <td>
          ${formatPeso(transaction.total)}
          ${refunded > 0 ? `<br><small>Refunded: ${formatPeso(refunded)}</small>` : ''}
        </td>
        <td>
          <span class="transaction-status ${status}">
            ${statusLabels[status]}
          </span>
        </td>
        <td>
          <button
            type="button"
            class="refund-btn"
            data-refund="${escapeHTML(transaction.id)}"
            ${status === 'completed' ? '' : 'disabled'}
          >Refund</button>
          <button
            type="button"
            class="void-btn"
            data-void="${escapeHTML(transaction.id)}"
            ${status === 'completed' ? '' : 'disabled'}
          >Void</button>
        </td>
      </tr>
    `);
  });

  if (!visible.length) {
    transactionTableBody.insertAdjacentHTML('beforeend', `
      <tr>
        <td colspan="7" style="text-align:center;padding:30px;">
          No transactions found
        </td>
      </tr>
    `);
  }

  transactionPage.textContent = `Page ${currentTransactionPage} of ${totalPages}`;

  transactionPrevBtn.disabled = currentTransactionPage === 1;
  transactionNextBtn.disabled = currentTransactionPage === totalPages;
}

async function confirmRefund(transaction) {
  const question = `Refund ${formatPeso(transaction.total)} for ${transaction.receipt_no}? The items will be returned to stock.`;

  if (!(await askModal(question, 'Refund', 'Refund transaction?'))) return;

  try {
    await refundTransaction(transaction.id);
    successModal('The transaction was refunded.', 'Refunded');
    await loadTransactions();
  } catch (error) {
    errorModal(error.message);
  }
}

async function confirmVoid(transaction) {
  const question = `Void ${transaction.receipt_no}? The sale will be cancelled and the items returned to stock.`;

  if (!(await askModal(question, 'Void', 'Void transaction?'))) return;

  try {
    await voidTransaction(transaction.id);
    successModal('The transaction was voided.', 'Voided');
    await loadTransactions();
  } catch (error) {
    errorModal(error.message);
  }
}

// showLoader is false for silent realtime refreshes
async function loadTransactions(showLoader = true) {
  if (!transactionTableBody) return;

  if (showLoader) {
    transactionTableBody.innerHTML = `
      <tr class="loading-row">
        <td colspan="7"><div class="loader"></div></td>
      </tr>
    `;
  }

  try {
    transactions = await fetchTransactions();
    renderTransactions();
  } catch (error) {
    console.error('Failed to load transactions:', error);

    transactionTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:30px;">
          Failed to load transactions: ${escapeHTML(error.message)}
        </td>
      </tr>
    `;
  }
}

if (transactionTableBody) {
  transactionDateFilter.addEventListener('change', setTransactionDates);

  [transactionDateFrom, transactionDateTo].forEach(input => {
    input.addEventListener('change', () => {
      transactionDateFilter.value = 'custom';
      currentTransactionPage = 1;
      renderTransactions();
    });
  });

  transactionStatusFilter.addEventListener('change', () => {
    currentTransactionPage = 1;
    renderTransactions();
  });

  transactionSearch.addEventListener('input', () => {
    currentTransactionPage = 1;
    renderTransactions();
  });

  transactionPrevBtn.addEventListener('click', () => {
    if (currentTransactionPage > 1) {
      currentTransactionPage--;
      renderTransactions();
    }
  });

  transactionNextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(getFilteredTransactions().length / transactionPageSize);

    if (currentTransactionPage < totalPages) {
      currentTransactionPage++;
      renderTransactions();
    }
  });

  transactionTableBody.addEventListener('click', event => {
    const refundButton = event.target.closest('[data-refund]');

    if (refundButton) {
      const target = transactions.find(item =>
        String(item.id) === refundButton.dataset.refund
      );

      if (target) confirmRefund(target);
      return;
    }

    const voidButton = event.target.closest('[data-void]');

    if (voidButton) {
      const target = transactions.find(item =>
        String(item.id) === voidButton.dataset.void
      );

      if (target) confirmVoid(target);
      return;
    }

    const row = event.target.closest('tr[data-id]');
    if (!row) return;

    const transaction = transactions.find(item =>
      String(item.id) === row.dataset.id
    );

    if (transaction) showTransactionModal(transaction);
  });

  setTransactionDates();
  loadTransactions();
}
