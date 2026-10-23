const posPanel = document.querySelector('.pos-main');
const recordPanel = document.querySelector('.record-main');
const recordItems = document.getElementById('recordItems');

const recordPrev = document.getElementById('recordPrev');
const recordNext = document.getElementById('recordNext');
const recordPage = document.getElementById('recordPage');

const refundBtn = document.getElementById('refundBtn');

const RECORDS_PER_PAGE = 20;

let records = [];
let currentPage = 1;
let selectedRecordId = null;


function showView(element) {
  if (element === 'record') {
    posPanel.classList.remove('show');
    recordPanel.classList.add('show');
    currentPage = 1;
    loadRecords();
  }
  else if (element === 'pos') {
    recordPanel.classList.remove('show');
    posPanel.classList.add('show');
  }
}

function compareNewest(first, second) {
  return new Date(second.date) - new Date(first.date);
}

async function loadRecords() {
  recordItems.innerHTML = '<div class="record-loading"><div class="loader"></div></div>';

  try {
    await fetchRecords();
    renderRecords();
  } catch (error) {
    
    alert(error);
    showModal('Unable to load records. Please try again.');
  }
}

function findRecord(id) {
  for (const record of records) {
    if (Number(record.id) === Number(id)) {
      return record;
    }
  }

  return null;
}

function getTotalPages() {
  return Math.max(1, Math.ceil(records.length / RECORDS_PER_PAGE));
}

function updatePagination() {
  const totalPages = getTotalPages();

  recordPrev.style.display = currentPage > 1 ? '' : 'none';
  recordNext.style.display = currentPage < totalPages ? '' : 'none';
  recordPage.textContent = 'Page ' + currentPage + ' of ' + totalPages;
}

function goToPage(page) {
  currentPage = page;
  renderRecords();
  recordItems.scrollTop = 0;
}

recordPrev.addEventListener('click', function () {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
});

recordNext.addEventListener('click', function () {
  if (currentPage < getTotalPages()) {
    goToPage(currentPage + 1);
  }
});

function renderRecords() {
  recordItems.replaceChildren();

  if (currentPage > getTotalPages()) {
    currentPage = getTotalPages();
  }

  updatePagination();

  if (records.length === 0) {
    const empty = document.createElement('p');

    empty.textContent = 'No records yet.';
    recordItems.appendChild(empty);
    clearReceipt();
    updateRefundButton();
    return;
  }

  const start = (currentPage - 1) * RECORDS_PER_PAGE;
  const pageRecords = records.slice(start, start + RECORDS_PER_PAGE);

  if (!pageRecords.some(function (r) {
    return Number(r.id) === Number(selectedRecordId);
  })) {
    selectedRecordId = pageRecords[0].id;
  }

  for (const record of pageRecords) {
    const item = document.createElement('div');
    const details = document.createElement('div');
    const number = document.createElement('strong');
    const date = document.createElement('span');
    const total = document.createElement('strong');

    item.className = 'record-item';
    item.dataset.id = record.id;
    number.textContent = 'Receipt #' + record.receiptNo;
    date.textContent = formatDate(record.date);
    total.textContent = formatMoney(record.total);

    if (Number(record.id) === Number(selectedRecordId)) {
      item.classList.add('active');
    }

    details.appendChild(number);
    details.appendChild(date);
    item.appendChild(details);
    item.appendChild(total);

    item.addEventListener('click', selectRecord);
    recordItems.appendChild(item);
  }

  showReceipt(findRecord(selectedRecordId));
  updateRefundButton();
}

function selectRecord(event) {
  selectedRecordId = Number(event.currentTarget.dataset.id);

  const items = recordItems.querySelectorAll('.record-item');

  for (const item of items) {
    item.classList.toggle('active', Number(item.dataset.id) === selectedRecordId);
  }

  showReceipt(findRecord(selectedRecordId));
  updateRefundButton();
}

function updateRefundButton() {
  const record = findRecord(selectedRecordId);

  refundBtn.disabled = !record || record.refunded || record.voided;
  refundBtn.textContent = record && record.voided ? 'Voided' : record && record.refunded ? 'Refunded' : 'Refund';
}

function refundSelected() {
  const record = findRecord(selectedRecordId);

  if (!record || record.refunded || record.voided) return;

  showModal(
    'Refund receipt #' + record.receiptNo + ' (' + formatMoney(record.total) + ')? Items will be returned to stock.',
    async () => {
      try {
        await refundSale(record.id);
        await loadRecords();
        await initialize();
        showModal('Refund complete.', null, 'success');
      } catch (error) {
        showModal(error.message || 'Unable to refund. Please try again.');
      }
    }
  );
}
