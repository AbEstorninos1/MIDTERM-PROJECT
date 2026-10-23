<section id="transaction-history" hidden>

  <div class="transaction-filters">
    <div class="transaction-filter">
      <span>Filter</span>
      <select id="transactionDateFilter">
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="7days" selected>Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
        <option value="month">This Month</option>
        <option value="lastmonth">Last Month</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>

    <div class="transaction-filter">
      <span>From</span>
      <input type="date" id="transactionDateFrom">
    </div>

    <div class="transaction-filter">
      <span>To</span>
      <input type="date" id="transactionDateTo">
    </div>

    <div class="transaction-filter">
      <span>Status</span>
      <select id="transactionStatusFilter">
        <option value="all">All Status</option>
        <option value="completed">Completed</option>
        <option value="refunded">Refunded</option>
        <option value="voided">Voided</option>
      </select>
    </div>

    <div class="transaction-search">
      <input
        type="search"
        id="transactionSearch"
        placeholder="Search receipt or cashier..."
      >
    </div>
  </div>

  <div class="transaction-content">
    <table class="transaction-table">
      <thead>
        <tr>
          <th>Receipt No.</th>
          <th>Date & Time</th>
          <th>Cashier</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody id="transactionTableBody"></tbody>
    </table>
  </div>

  <footer class="transaction-footer">
    <div class="transaction-pagination">
      <button id="transactionPrevBtn" type="button">Previous</button>
      <span id="transactionPage">Page 1</span>
      <button id="transactionNextBtn" type="button">Next</button>
    </div>
  </footer>
</section>