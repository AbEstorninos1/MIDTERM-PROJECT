<main class="record-main" id="viewRecord" hidden>

      <section class="record-list">
        <h2>Records</h2>
        <div id="recordItems"></div>

        <div class="record-pagination">
          <button
            class="record-arrow"
            id="recordPrev"
            type="button"
            aria-label="Previous page"
          >&lt;</button>

          <span class="record-page" id="recordPage"></span>

          <button
            class="record-arrow"
            id="recordNext"
            type="button"
            aria-label="Next page"
          >&gt;</button>
        </div>
      </section>

      <section class="record-preview">
        <h2 class="record-heading">Receipt preview</h2>

        <div class="receipt-paper" id="recordPreview"></div>

        <div class="record-actions">
          <button
            type="button"
            class="btn-print"
            onclick="printReceipt()"
          >Print receipt</button>

          <button
            type="button"
            class="btn-refund"
            id="refundBtn"
            onclick="refundSelected()"
          >Refund</button>
        </div>
      </section>

    </main>
