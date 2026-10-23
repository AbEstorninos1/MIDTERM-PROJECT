function renderCharts(data) {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded');
    return;
  }
  const salesCanvas = document.getElementById('salesChart');
  const productsCanvas = document.getElementById('topProductsChart');

  const existingSalesChart = Chart.getChart(salesCanvas);
  const existingProductsChart = Chart.getChart(productsCanvas);
  if (existingSalesChart) existingSalesChart.destroy();
  if (existingProductsChart) existingProductsChart.destroy();

  new Chart(salesCanvas, {
    type: 'line',
    data: {
      labels: data.salesChart.map(item => item.date),
      datasets: [{
        label: 'Sales',
        data: data.salesChart.map(item => Number(item.total)),
        borderColor: '#ef4444',
        backgroundColor: '#ef444454',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: context => formatCurrency(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => '₱' + Number(value).toLocaleString()
          }
        }
      }
    }
  });

  new Chart(productsCanvas, {
    type: 'bar',
    data: {
      labels: data.topProducts.map(item => item.name),
      datasets: [{
        label: 'Quantity Sold',
        data: data.topProducts.map(item => Number(item.quantity)),
        backgroundColor: [
          '#ef4444',
          '#ef4444',
          '#ef4444',
          '#ef4444',
          '#ef4444'
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

function formatCurrency(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function renderLowStock(products) {
  const container = document.getElementById('lowStockItems');

  if (!container) {
    console.error('Low stock container not found');
    return;
  }

  container.replaceChildren();

  if (!products || products.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');

    cell.colSpan = 4;
    cell.textContent = 'No low stock products';

    row.appendChild(cell);
    container.appendChild(row);
    return;
  }

  products.forEach(product => {
    const row = document.createElement('tr');

    const values = [
      product.product,
      product.category,
      product.stock
    ];

    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    const statusCell = document.createElement('td');
    const status = document.createElement('span');

    const stock = Number(product.stock);

    status.className = stock <= 0
      ? 'stock-badge out-of-stock'
      : 'stock-badge';

    status.textContent = stock <= 0
      ? 'Out of Stock'
      : 'Low Stock';

    statusCell.appendChild(status);
    row.appendChild(statusCell);
    container.appendChild(row);
  });
}

function renderRecentTransactions(transactions) {
  const container = document.getElementById('recentTransactions');

  if (!container) {
    console.error('Recent transactions container not found');
    return;
  }

  container.replaceChildren();

  if (!transactions || transactions.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');

    cell.colSpan = 4;
    cell.textContent = 'No recent transactions';

    row.appendChild(cell);
    container.appendChild(row);
    return;
  }

  transactions.forEach(transaction => {
    const row = document.createElement('tr');

    const values = [
      transaction.receipt,
      transaction.cashier,
      formatCurrency(transaction.total),
      transaction.date
    ];

    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    container.appendChild(row);
  });
}