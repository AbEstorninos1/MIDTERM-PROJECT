
<div class="checkout-modal" id="checkoutModal" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle" hidden>
  <div class="checkout-modal-content">

    <header class="checkout-modal-header">
      <h2 id="checkoutTitle">Checkout</h2>
      <button type="button" id="closeCheckout" aria-label="Close checkout">&times;</button>
    </header>

    <div class="checkout-modal-body">

      <section class="checkout-payment">

        <div class="payment-total">
          <span>Total Amount Due</span>
          <h1 id="paymentTotal">₱0.00</h1>
        </div>

        <div class="payment-method">
          <span>Payment Method</span>
          <div class="payment-method-cash">
            Cash
          </div>
        </div>

        <div class="payment-input">
          <label for="paymentAmount">Cash Received</label>
          <input
            type="number"
            id="paymentAmount"
            placeholder="0.00"
            min="0"
            step="0.01"
            inputmode="decimal"
          >
        </div>

        <div class="payment-quick">
          <span>Quick Cash</span>

          <div class="payment-quick-buttons">
            <button type="button" data-cash="500">₱500</button>
            <button type="button" data-cash="1000">₱1,000</button>
            <button type="button" data-cash="1500">₱1,500</button>
            <button type="button" data-cash="2000">₱2,000</button>
            <button type="button" data-cash="5000">₱5,000</button>
            <button type="button" data-cash="exact">Exact</button>
          </div>
        </div>

        <div class="payment-change" id="paymentChange" hidden>
          <span>Change</span>
          <strong id="changeAmount">₱0.00</strong>
        </div>

  

      </section>

      <section class="checkout-receipt">
        <div class="checkout-receipt-paper">

          <div class="checkout-receipt-header">
            <strong>JM Aviles Hardware</strong>
          </div>

          <div class="checkout-receipt-items" id="checkoutReceiptItems"></div>

          <div class="checkout-receipt-summary">
            <div>
              <span>Total</span>
              <span id="receiptTotal">₱0.00</span>
            </div>

            <div>
              <span>Cash</span>
              <span id="receiptCash">₱0.00</span>
            </div>

            <div>
              <span>Change</span>
              <span id="receiptChange">₱0.00</span>
            </div>
          </div>

          
        </div>
      </section>

    </div>

    <footer class="checkout-modal-footer">
      <button type="button" class="checkout-cancel" id="cancelCheckout">
        Cancel
      </button>

      <button type="button" class="checkout-confirm" id="confirmPayment" disabled>
        Confirm Payment
      </button>
    </footer>

  </div>
</div>
