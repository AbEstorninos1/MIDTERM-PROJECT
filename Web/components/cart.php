<aside class="checkout-container">

        <h2 class="cart-title">Cart</h2>

        <button class="scan" id="scanBtn" type="button">
          <img
            src="../assets/images/scan-barcode.svg"
            alt=""
            class="scanlogo"
          >
          SCAN PRODUCT
        </button>

        <div class="cart" id="cartItems"></div>

        <div class="cart-total" id="cartTotal">
          <p class="grand"><span>Total</span><span id="cartTotalAmount">₱0.00</span></p>
        </div>

        <p class="cart-message" id="cartMessage"></p>

        <button
          class="checkout-btn"
          type="button"
          onclick="checkout()"
        >CHECKOUT</button>

      </aside>
