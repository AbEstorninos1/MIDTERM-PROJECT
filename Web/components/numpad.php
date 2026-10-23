<div class="num-pad-panel">
  <div class="breadCrumbContainer"></div>

  <input
    type="text"
    id="numInput"
    class="num-pad-input"
    readonly
    placeholder='Enter Quantity'
  >

  <div class="num-pad-btn" id="numKeys">
    <?php
      $keys = [
        7, 8, 9,
        4, 5, 6,
        1, 2, 3
      ];

      foreach ($keys as $key) {
        echo "<button type='button' value='$key' onclick='pressKey(this.value)'>$key</button>";
      }
    ?>

    <button type="button" class="clear" onclick="pressKey('C')">C</button>
    <button type="button" value="0" onclick="pressKey(this.value)">0</button>
    <button type="button" onclick="pressKey('back')">⌫</button>

    <button
      type="button"
      class="enter"
      id="enterButton"
      onclick="pressEnter()"
    >Add to cart</button>
  </div>
</div>