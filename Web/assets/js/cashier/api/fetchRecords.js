async function fetchRecords() {
  const response = await fetch('../api/cashier/sales/records.php');

  if (!response.ok) {
    throw new Error('Failed to fetch records.');
  }

  records = await response.json();
  records.sort(compareNewest);
}