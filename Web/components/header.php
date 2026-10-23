<header class="pos-header">
      <nav class="pos-nav">

        <div class="nav-left">
          <button
            type="button"
            class="nav-tab active"
            id="tabPos"
            onclick="showView('pos')"
          >POS</button>

          <button
            type="button"
            class="nav-tab"
            id="tabRecord"
            onclick="showView('record')"
          >Record</button>
        </div>

        <strong class="system-name">JM Aviles Hardware</strong>

        <div class="nav-right">
          <div class="search-container">
            <div class="search-wrapper">
              <input
                type="text"
                id="searchInput"
                placeholder="Search products..."
              >

              <button
                type="button"
                class="clear-icon"
                aria-label="Clear search"
              >
                <img src="../assets/images/close.svg" alt="">
              </button>
            </div>

            <button
              type="button"
              class="search-icon"
              aria-label="Search"
            >
              <img src="../assets/images/search.svg" alt="">
            </button>
          </div>

          <span id="cashierName" title="Logged in user"><?= htmlspecialchars($_SESSION['user']['username'] ?? '') ?></span>

          <button type="button" class="logout-btn" onclick="confirmLogout()">Logout</button>
        </div>

      </nav>
    </header>
