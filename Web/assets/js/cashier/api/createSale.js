async function createSale(items, total, paid) {
  const res = await fetch('../api/cashier/sales/checkout.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items,
      total,
      paid,
      change: paid - total
    })
  });

  const text = await res.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Server error: ' + (text.slice(0, 150) || 'empty response'));
  }

  if (!data.success) {
    throw new Error(data.message || 'Failed to create sale');
  }

  return data;
}