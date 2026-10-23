let salesChart = null;
let topProductsChart = null;

async function loadDashboard() {
  try {
    const res = await fetch('../api/admin/sales/dashboard.php');

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error('Failed to load dashboard');
    }

    document.getElementById('statSales').textContent =
      '₱' + Number(data.stats.sales).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

    document.getElementById('statTransactions').textContent =
      data.stats.transactions;

    document.getElementById('statProducts').textContent =
      data.stats.products;

    document.getElementById('statLowStock').textContent =
      data.stats.lowStock;

    

    renderCharts(data);
    renderLowStock(data.lowStockProducts);
    renderRecentTransactions(data.recentTransactions);

  } catch (error) {
    console.error('Dashboard Error:', error);
  }
}

loadDashboard();