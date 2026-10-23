async function refundTransaction(id) {
  const response = await fetch('../api/cashier/sales/refund.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to refund.');
  }

  return result;
}

async function voidTransaction(id) {
  const response = await fetch('../api/admin/sales/void.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to void.');
  }

  return result;
}

async function fetchTransactions() {
  const response = await fetch('../api/admin/sales/transaction.php', {
    cache: 'no-store'
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Server did not return JSON: ' + text.slice(0, 300));
  }

  if (!response.ok || !Array.isArray(data)) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
}
