<section class="admin-content">
  <section id="dashboard">

    <div class="dashboard-stats">
      <div class="stat-card">
        <p class="stat-label">Total Sales</p>
        <p class="stat-value" id="statSales">₱0.00</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Transactions</p>
        <p class="stat-value" id="statTransactions">0</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Products</p>
        <p class="stat-value" id="statProducts">0</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Low Stock</p>
        <p class="stat-value" id="statLowStock">0</p>
      </div>

    </div>

    <div class="dashboard-charts">
      <div class="chart-card">
        <h3>Sales Overview</h3>
        <div class="chart-container">
          <canvas id="salesChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Top Products</h3>
        <div class="chart-container">
          <canvas id="topProductsChart"></canvas>
        </div>
      </div>
    </div>

    <div class="dashboard-tables">
      <div class="table-card">
        <div class="table-header">
          <h3>Low Stock Products</h3>
          <span>Products that need restocking</span>
        </div>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="lowStockItems"></tbody>
          </table>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Recent Transactions</h3>
          <span>Latest completed sales</span>
        </div>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Cashier</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="recentTransactions"></tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</section>
