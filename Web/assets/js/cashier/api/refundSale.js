async function refundSale(id) {
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
