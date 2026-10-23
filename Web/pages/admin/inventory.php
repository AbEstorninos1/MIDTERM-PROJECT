<section id="inventory" hidden>
  <div class="inventory-actions">
    <div class="inventory-buttons">
      <button type="button" id="addCategoryBtn" class="secondary-btn">+ Add Category</button>
      <button type="button" id="addProductBtn">+ Add Product</button>
    </div>
  </div>

  <div class="inventory-filters">
    <input type="search" id="inventorySearch" placeholder="Search name or barcode...">

    <select id="categoryFilter">
      <option value="all">All Categories</option>
    </select>

    <select id="inventorySort">
      <option value="newest">Newest</option>
      <option value="most-sold">Most Sold</option>
      <option value="least-sold">Least Sold</option>
      <option value="highest-stock">Highest Stock</option>
      <option value="lowest-stock">Lowest Stock</option>
    </select>
  </div>

  <div class="inventory-content">
    <div class="inventory-table-container">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>

        <tbody id="inventoryTableBody"></tbody>
      </table>

      <div class="inventory-pagination">
        <button type="button" id="inventoryPrev">Previous</button>
        <span id="inventoryPage">Page 1</span>
        <button type="button" id="inventoryNext">Next</button>
      </div>
    </div>
  </div>
</section>
