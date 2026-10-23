<?php
session_start();
require_once __DIR__ . '/../config/database.php';
header('Content-Type: text/html; charset=utf-8');
restoreLogin($conn);

if (!isset($_SESSION['user'])) {
  header('Location: ../index.php');
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POS</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="../assets/css/cashier/product-selection.css">
  <link rel="stylesheet" href="../assets/css/cashier/product-variants.css">
  <link rel="stylesheet" href="../assets/css/cashier/barcode-scanner.css">
  <link rel="stylesheet" href="../assets/css/cashier/product-category.css">
  <link rel="stylesheet" href="../assets/css/cashier/num-pad.css">
  <link rel="stylesheet" href="../assets/css/cashier/receipt.css">
  <link rel="stylesheet" href="../assets/css/cashier/checkout.css">
  <link rel="stylesheet" href="../assets/css/cashier/pos.css">
  <link rel="stylesheet" href="../assets/css/cashier/record.css">
  <link rel="stylesheet" href="../assets/css/cashier/verifyModal.css">
  <link rel="stylesheet" href="../assets/css/cashier/checkoutModal.css">
</head>
<body>

  <div class="pos-container">

    <?php include '../components/verify-modal.php'; ?>

    <?php include '../components/header.php'; ?>

    <main class="pos-main" id="viewPos">

     <?php include '../components/record.php'; ?>

      <section class="product-entry-panel">

        <?php include '../components/barcode-panel.php'; ?>

        <?php include '../components/product-selection.php'; ?>

      </section>

     
      <div class='num-pad-container'>
        <?php include '../components/numpad.php'; ?>
      </div>
      
      

      <?php include '../components/cart.php'; ?>

    </main>

    <?php include '../components/checkout.php'; ?>

  </div>

  <?php include '../components/receipt-modal.php'; ?>
  <script>window.APP_ROOT = '../';</script>
  <script src="../assets/js/shared/utils.js"></script>
  <script src="../assets/js/shared/imageCache.js"></script>
  <script src="../assets/js/cashier/features/refresh.js">     </script>
  <script src="../assets/js/cashier/features/cart.js">     </script>
  <script src="../assets/js/cashier/features/activeBtn.js"></script>
  <script src="../assets/js/cashier/features/search.js"></script>
  <script src="../library/node_modules/html5-qrcode/html5-qrcode.min.js"></script>
  <script>
    
    if (typeof Html5Qrcode === 'undefined') {
      document.write('<script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js"><\/script>');
    }
  </script>
  <script src="../assets/js/cashier/features/scanner.js"></script>
  <script src="../assets/js/cashier/features/barcode.js"></script>
  <script src="../assets/js/cashier/features/receipt.js"></script>
  <script src="../assets/js/cashier/api/fetchRecords.js"></script>
  <script src="../assets/js/cashier/api/refundSale.js"></script>
  <script src="../assets/js/cashier/features/record.js"></script>
  <script src="../assets/js/cashier/features/modal.js">  </script>
<script src="../assets/js/cashier/api/fetchProducts.js">  </script>
<script src="../assets/js/cashier/features/products.js"></script>
<script src="../assets/js/cashier/features/product-variants.js"></script>
<script src="../assets/js/cashier/features/numpad.js"></script>
<script src="../assets/js/cashier/features/category.js"></script>
<script src="../assets/js/cashier/api/createSale.js"></script>
<script src="../assets/js/cashier/features/checkout.js"></script>

<script>
  
</script>


</body>
</html>